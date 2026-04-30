import { Router } from 'express'
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  getMembers,
  removeMember,
  updateMemberRole,
} from '../controllers/workspace.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/rbac.middleware.js'

const router = Router()

router.use(verifyToken)

router.post('/',                                          createWorkspace)
router.get('/',                                          getMyWorkspaces)
router.get('/:workspaceId',                              getWorkspace)
router.put('/:workspaceId',   requireRole('Admin'),      updateWorkspace)
router.delete('/:workspaceId', requireRole('Admin'),     deleteWorkspace)

router.post('/:workspaceId/invite',  requireRole('Admin'), inviteMember)
router.get('/:workspaceId/members',                        getMembers)
router.delete('/:workspaceId/members/:userId', requireRole('Admin'), removeMember)
router.put('/:workspaceId/members/:userId',    requireRole('Admin'), updateMemberRole)

export default router