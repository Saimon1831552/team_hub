import prisma from '../lib/prisma.js'

export function requireRole(...roles) {
  return async (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID required' })
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.userId,
          workspaceId,
        },
      },
    })

    if (!member || !roles.includes(member.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    req.userRole = member.role
    next()
  }
}