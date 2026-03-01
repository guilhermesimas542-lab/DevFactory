import express from 'express'
import cors from 'cors'
import { logger } from './middleware/logger'
import { errorHandler } from './middleware/errorHandler'
import healthRoutes from './routes/health'
import databaseRoutes from './routes/database'

const app = express()
const PORT = process.env.PORT || 5000

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
app.use('/api/db', databaseRoutes)

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

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
