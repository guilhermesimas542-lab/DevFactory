import express from 'express'
import { logger } from './middleware/logger'
import { errorHandler } from './middleware/errorHandler'
import healthRoutes from './routes/health'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logger)

// Routes
app.use('/api', healthRoutes)

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
