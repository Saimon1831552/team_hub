import { Router } from 'express'
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
  addReaction,
  addComment,
  getComments,
} from '../controllers/announcement.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/rbac.middleware.js'

const router = Router({ mergeParams: true })

router.use(verifyToken)

router.post('/',                                        requireRole('Admin'), createAnnouncement)
router.get('/',                                         getAnnouncements)
router.put('/:announcementId',                          requireRole('Admin'), updateAnnouncement)
router.delete('/:announcementId',                       requireRole('Admin'), deleteAnnouncement)
router.patch('/:announcementId/pin',                    requireRole('Admin'), pinAnnouncement)
router.post('/:announcementId/reactions',               addReaction)
router.post('/:announcementId/comments',                addComment)
router.get('/:announcementId/comments',                 getComments)

export default router