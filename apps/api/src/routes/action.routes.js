import { Router } from 'express'
import {
  createAction,
  getActions,
  updateAction,
  deleteAction,
} from '../controllers/action.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router({ mergeParams: true })

router.use(verifyToken)

router.post('/',              createAction)
router.get('/',               getActions)
router.put('/:actionId',      updateAction)
router.delete('/:actionId',   deleteAction)

export default router