import { Router } from 'express'
import { getDashboardStats, exportCSV } from '../controllers/analytics.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router({ mergeParams: true })

router.use(verifyToken)

router.get('/stats', getDashboardStats)
router.get('/export', exportCSV)

export default router