import express from 'express'
import cors from 'cors'
import { execSync } from 'child_process'
import { logger } from './middleware/logger'
import { errorHandler } from './middleware/errorHandler'
import healthRoutes from './routes/health'
import dbTestRoutes from './routes/db-test'
import projectsRoutes from './routes/projects'
import storiesRoutes from './routes/stories'
import alertsRoutes from './routes/alerts'
import glossaryRoutes from './routes/glossary'
import activityRoutes from './routes/activity'
import chatRoutes from './routes/chat'
import learningRoutes from './routes/learning'
import webhooksRoutes from './routes/webhooks'
import debugRoutes from './routes/debug'
import { WebhookService } from './services/WebhookService'

const app = express()
const PORT = process.env.PORT || 5000

// Run Prisma migrations asynchronously (non-blocking)
async function runMigrationsAsync() {
  try {
    console.log('🔄 Running Prisma migrations...')
    console.time('Prisma migration')
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: process.cwd(),
      timeout: 30000 // 30 second timeout
    })
    console.timeEnd('Prisma migration')
    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error // Don't block server startup
  }
}

// CORS Configuration
const corsOrigins = [
  'https://dev-factory-al5c-1xuy6u0rw-guilhermes-projects-05207aa8.vercel.app',
  'https://dev-factory-al5c.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://192.168.0.136:3000',
  'http://192.168.0.136:3001',
]

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl requests, Electron)
    if (!origin) return callback(null, true)

    // Allow localhost and development origins
    if (origin.includes('localhost') || origin.includes('192.168') || origin === 'file://') {
      return callback(null, true)
    }

    // Check against whitelist
    if (corsOrigins.includes(origin)) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logger)

// Webhook routes FIRST (NO CORS - allow ANY origin for webhooks, validated via signature)
app.options('/api/webhooks/github', (_req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST')
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256, X-GitHub-Event, X-GitHub-Delivery')
  res.sendStatus(200)
})
app.use('/api/webhooks', webhooksRoutes)

// All other routes WITH CORS
app.use('/api', cors(corsOptions), healthRoutes)
app.use('/api/db', cors(corsOptions), dbTestRoutes)
app.use('/api/projects', cors(corsOptions), projectsRoutes)
app.use('/api/stories', cors(corsOptions), storiesRoutes)
app.use('/api/alerts', cors(corsOptions), alertsRoutes)
app.use('/api/glossary', cors(corsOptions), glossaryRoutes)
app.use('/api/activity', cors(corsOptions), activityRoutes)
app.use('/api/chat', cors(corsOptions), chatRoutes)
app.use('/api/learning', cors(corsOptions), learningRoutes)
app.use('/api/debug', cors(corsOptions), debugRoutes)

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 404,
      message: 'Not Found',
    },
  })
})

// Error Handler (deve ser o último middleware)
app.use(errorHandler)

// Start Server FIRST (non-blocking)
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

// Try migrations in background (won't block server startup)
runMigrationsAsync().catch(_error => {
  console.error('⚠️ Async migration failed, server continuing anyway...')
  // Server stays alive even if migration fails
})

// GitHub sync job - runs every 5 minutes
setInterval(async () => {
  try {
    console.log(`\n[GitHub Job] ===== Iniciando sync - ${new Date().toISOString()} =====`)

    // Dynamic import to avoid module initialization order issues
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const projectsWithGitHub = await prisma.project.findMany({
      where: {
        github_repo_url: { not: null }
      },
      select: {
        id: true,
        name: true,
        github_repo_url: true
      }
    })

    console.log(`[GitHub Job] 📊 Projetos encontrados: ${projectsWithGitHub.length}`)
    if (projectsWithGitHub.length === 0) {
      console.log(`[GitHub Job] ⚠️ Nenhum projeto com github_repo_url configurado!`)
    }

    for (const project of projectsWithGitHub) {
      try {
        console.log(`[GitHub Job] 🔄 Sincronizando: ${project.name} → ${project.github_repo_url}`)

        // Call sync endpoint internally
        const syncUrl = `http://localhost:${PORT}/api/projects/${project.id}/sync-github`
        const response = await fetch(syncUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          const result = await response.json() as any
          const storiesCount = result.data?.stories_updated?.length || 0
          console.log(`[GitHub Job] ✅ Sincronização concluída: ${storiesCount} stories atualizadas`)
          console.log(`[GitHub Job] 📝 Resultado completo:`, JSON.stringify(result, null, 2))
        } else {
          console.error(`[GitHub Job] ❌ Falha na sincronização (${response.status}): ${response.statusText}`)
        }
      } catch (error) {
        console.error(`[GitHub Job] ❌ Erro ao sincronizar ${project.name}:`, error)
      }
    }

    await prisma.$disconnect()
    console.log(`[GitHub Job] ===== Ciclo concluído =====\n`)
  } catch (error) {
    console.error('[GitHub Job] ❌ Job falhou:', error)
  }
}, 5 * 60 * 1000) // 5 minutes

// Webhook retry worker - runs every 2 minutes
setInterval(async () => {
  try {
    console.log('⏰ Webhook retry worker started')
    const retriedCount = await WebhookService.processRetries()
    console.log(`✅ Webhook retry worker completed: ${retriedCount} retries processed`)
  } catch (error) {
    console.error('❌ Webhook retry worker failed:', error)
  }
}, 2 * 60 * 1000) // 2 minutes

// Webhook cleanup job - runs every 24 hours
setInterval(async () => {
  try {
    console.log('🗑️ Webhook cleanup job started')
    const cleanedCount = await WebhookService.cleanupOldLogs(30)
    console.log(`✅ Webhook cleanup completed: ${cleanedCount} logs deleted`)
  } catch (error) {
    console.error('❌ Webhook cleanup job failed:', error)
  }
}, 24 * 60 * 60 * 1000) // 24 hours

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
