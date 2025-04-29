import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const router = Router()

router.get('/dashboard', async (req, res) => {
    
})

export default router