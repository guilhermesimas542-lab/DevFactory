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
app.use(cors({
  origin: [
    'https://dev-factory-al5c-1xuy6u0rw-guilhermes-projects-05207aa8.vercel.app',
    'https://dev-factory-al5c.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logger)

// Routes
app.use('/api', healthRoutes)
app.use('/api/db', dbTestRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/stories', storiesRoutes)
app.use('/api/alerts', alertsRoutes)
app.use('/api/glossary', glossaryRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/learning', learningRoutes)
app.use('/api/webhooks', webhooksRoutes)

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
    console.log('🔄 GitHub sync job started')

    // Dynamic import to avoid module initialization order issues
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const projectsWithGitHub = await prisma.project.findMany({
      where: {
        github_repo_url: { not: null }
      },
      select: {
        id: true,
        github_repo_url: true
      }
    })

    console.log(`📊 Found ${projectsWithGitHub.length} projects with GitHub configured`)

    for (const project of projectsWithGitHub) {
      try {
        // Call sync endpoint internally
        const syncUrl = `http://localhost:${PORT}/api/projects/${project.id}/sync-github`
        const response = await fetch(syncUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          const result = await response.json() as any
          console.log(`✅ Synced project ${project.id}: ${result.data.stories_updated.length} stories updated`)
        } else {
          console.error(`⚠️ Failed to sync project ${project.id}: ${response.statusText}`)
        }
      } catch (error) {
        console.error(`❌ Error syncing project ${project.id}:`, error)
      }
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ GitHub sync job failed:', error)
  }
}, 5 * 60 * 1000) // 5 minutes

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
