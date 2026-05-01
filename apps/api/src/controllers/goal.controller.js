import prisma from '../lib/prisma.js'

export async function createGoal(req, res) {
  try {
    const { workspaceId } = req.params
    const { title, description, dueDate, status } = req.body

    if (!title) return res.status(400).json({ message: 'Title is required' })

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.userId, workspaceId } },
    })
    if (!member) return res.status(403).json({ message: 'Access denied' })

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'active',
        ownerId: req.userId,
        workspaceId,
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        milestones: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'GOAL_CREATED',
        entityType: 'Goal',
        entityId: goal.id,
        userId: req.userId,
        workspaceId,
      },
    })

    // Real-time emit
    const io = req.app.get('io')
    io.to(`workspace:${workspaceId}`).emit('goal:new', goal)

    res.status(201).json({ goal })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getGoals(req, res) {
  try {
    const { workspaceId } = req.params
    const { status } = req.query

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.userId, workspaceId } },
    })
    if (!member) return res.status(403).json({ message: 'Access denied' })

    const goals = await prisma.goal.findMany({
      where: {
        workspaceId,
        ...(status && { status }),
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        milestones: true,
        _count: { select: { actions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ goals })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getGoal(req, res) {
  try {
    const { workspaceId, goalId } = req.params

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.userId, workspaceId } },
    })
    if (!member) return res.status(403).json({ message: 'Access denied' })

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        milestones: true,
        actions: {
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    })

    if (!goal) return res.status(404).json({ message: 'Goal not found' })
    res.json({ goal })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function updateGoal(req, res) {
  try {
    const { goalId, workspaceId } = req.params
    const { title, description, dueDate, status } = req.body

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.userId, workspaceId } },
    })
    if (!member) return res.status(403).json({ message: 'Access denied' })

    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(title       && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate     && { dueDate: new Date(dueDate) }),
        ...(status      && { status }),
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        milestones: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'GOAL_UPDATED',
        entityType: 'Goal',
        entityId: goalId,
        userId: req.userId,
        workspaceId,
      },
    })

    // Real-time emit
    const io = req.app.get('io')
    io.to(`workspace:${workspaceId}`).emit('goal:updated', goal)

    res.json({ goal })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function deleteGoal(req, res) {
  try {
    const { goalId, workspaceId } = req.params
    await prisma.goal.delete({ where: { id: goalId } })

    // Real-time emit
    const io = req.app.get('io')
    io.to(`workspace:${workspaceId}`).emit('goal:deleted', { id: goalId })

    res.json({ message: 'Goal deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function createMilestone(req, res) {
  try {
    const { goalId } = req.params
    const { title, progress } = req.body

    if (!title) return res.status(400).json({ message: 'Title is required' })

    const milestone = await prisma.milestone.create({
      data: { title, progress: progress || 0, goalId },
    })

    res.status(201).json({ milestone })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function updateMilestone(req, res) {
  try {
    const { milestoneId } = req.params
    const { title, progress } = req.body

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...(title    !== undefined && { title }),
        ...(progress !== undefined && { progress }),
      },
    })

    res.json({ milestone })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function deleteMilestone(req, res) {
  try {
    const { milestoneId } = req.params
    await prisma.milestone.delete({ where: { id: milestoneId } })
    res.json({ message: 'Milestone deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}