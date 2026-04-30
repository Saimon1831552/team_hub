import prisma from '../lib/prisma.js'

export async function createWorkspace(req, res) {
  try {
    const { name, description, accentColor } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        accentColor: accentColor || '#6366f1',
        members: {
          create: { userId: req.userId, role: 'Admin' },
        },
      },
      include: { members: true },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'WORKSPACE_CREATED',
        entityType: 'Workspace',
        entityId: workspace.id,
        userId: req.userId,
        workspaceId: workspace.id,
      },
    })

    res.status(201).json({ workspace })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getMyWorkspaces(req, res) {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.userId },
      include: {
        workspace: {
          include: { _count: { select: { members: true, goals: true } } },
        },
      },
    })

    const workspaces = memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }))

    res.json({ workspaces })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getWorkspace(req, res) {
  try {
    const { workspaceId } = req.params

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.userId, workspaceId } },
    })
    if (!member) return res.status(403).json({ message: 'Access denied' })

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        _count: { select: { goals: true, actions: true, announcements: true } },
      },
    })

    if (!workspace) return res.status(404).json({ message: 'Workspace not found' })
    res.json({ workspace })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function updateWorkspace(req, res) {
  try {
    const { workspaceId } = req.params
    const { name, description, accentColor } = req.body

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name, description, accentColor },
    })

    res.json({ workspace })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function deleteWorkspace(req, res) {
  try {
    const { workspaceId } = req.params
    await prisma.workspace.delete({ where: { id: workspaceId } })
    res.json({ message: 'Workspace deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function inviteMember(req, res) {
  try {
    const { workspaceId } = req.params
    const { email, role } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const existing = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    })
    if (existing) return res.status(409).json({ message: 'Already a member' })

    const member = await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId, role: role || 'Member' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    })

    await prisma.auditLog.create({
      data: {
        action: 'MEMBER_INVITED',
        entityType: 'User',
        entityId: user.id,
        userId: req.userId,
        workspaceId,
      },
    })

    res.status(201).json({ member })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getMembers(req, res) {
  try {
    const { workspaceId } = req.params

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    })

    res.json({ members })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function removeMember(req, res) {
  try {
    const { workspaceId, userId } = req.params

    await prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    })

    res.json({ message: 'Member removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function updateMemberRole(req, res) {
  try {
    const { workspaceId, userId } = req.params
    const { role } = req.body

    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    const member = await prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role },
    })

    res.json({ member })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}