import { Router } from 'express'
import { uploadAvatar } from '../controllers/upload.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar)

export default router