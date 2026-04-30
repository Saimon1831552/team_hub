import { Router } from 'express'
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../controllers/goal.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/rbac.middleware.js'

const router = Router({ mergeParams: true })

router.use(verifyToken)

router.post('/',                                      createGoal)
router.get('/',                                       getGoals)
router.get('/:goalId',                                getGoal)
router.put('/:goalId',                                updateGoal)
router.delete('/:goalId', requireRole('Admin'),       deleteGoal)

router.post('/:goalId/milestones',                    createMilestone)
router.put('/:goalId/milestones/:milestoneId',        updateMilestone)
router.delete('/:goalId/milestones/:milestoneId',     deleteMilestone)

export default router