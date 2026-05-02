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

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Workspace management
 */

const router = Router()

router.use(verifyToken)

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               accentColor:
 *                 type: string
 *                 example: "#6366f1"
 *     responses:
 *       201:
 *         description: Workspace created
 */
router.post('/', createWorkspace)

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get all workspaces for current user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */
router.get('/', getMyWorkspaces)

router.get('/:workspaceId', getWorkspace)
router.put('/:workspaceId', requireRole('Admin'), updateWorkspace)
router.delete('/:workspaceId', requireRole('Admin'), deleteWorkspace)
router.post('/:workspaceId/invite', requireRole('Admin'), inviteMember)
router.get('/:workspaceId/members', getMembers)
router.delete('/:workspaceId/members/:userId', requireRole('Admin'), removeMember)
router.put('/:workspaceId/members/:userId', requireRole('Admin'), updateMemberRole)

export default router