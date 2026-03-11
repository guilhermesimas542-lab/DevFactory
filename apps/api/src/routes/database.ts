import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/test', async (_req, res) => {
  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT NOW()`

    res.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: result,
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  } finally {
    await prisma.$disconnect()
  }
})

export default router
