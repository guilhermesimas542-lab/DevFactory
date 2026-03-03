import express from 'express'
import cors from 'cors'
import { execSync } from 'child_process'
import { logger } from './middleware/logger'
import { errorHandler } from './middleware/errorHandler'
import healthRoutes from './routes/health'
import dbTestRoutes from './routes/db-test'
import projectsRoutes from './routes/projects'

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
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

// Try migrations in background (won't block server startup)
runMigrationsAsync().catch(_error => {
  console.error('⚠️ Async migration failed, server continuing anyway...')
  // Server stays alive even if migration fails
})
