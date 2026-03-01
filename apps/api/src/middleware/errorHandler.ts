import { Request, Response, NextFunction } from 'express'

interface CustomError extends Error {
  statusCode?: number
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  console.error(`[Error] ${statusCode}: ${message}`)

  res.status(statusCode).json({
    error: {
      code: statusCode,
      message,
      timestamp: new Date().toISOString(),
    },
  })
}
