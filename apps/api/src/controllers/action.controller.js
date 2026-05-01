import prisma from '../lib/prisma.js'

export async function createAction(req, res) {
  try {
    const { workspaceId } = req.params
    const { title, assigneeId, goalId, priority, dueDate, status } = req.body

    if (!title) return res.status(400).json({ message: 'Title is required' })

    const action = await prisma.actionItem.create({
      data: {
        title,
        priority: priority || 'medium',
        status:   status   || 'todo',
        dueDate:  dueDate  ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        goalId:     goalId     || null,
        workspaceId,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        goal:     { select: { id: true, title: true } },
      },
    })

    // Real-time emit
    const io = req.app.get('io')
    io.to(`workspace:${workspaceId}`).emit('action:new', action)

    res.status(201).json({ action })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getActions(req, res) {
  try {
    const { workspaceId } = req.params
    const { status, priority, assigneeId, goalId } = req.query

    const actions = await prisma.actionItem.findMany({
      where: {
        workspaceId,
        ...(status     && { status }),
        ...(priority   && { priority }),
        ...(assigneeId && { assigneeId }),
        ...(goalId     && { goalId }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        goal:     { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ actions })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function updateAction(req, res) {
  try {
    const { actionId, workspaceId } = req.params
    const { title, status, priority, dueDate, assigneeId, goalId } = req.body

    const action = await prisma.actionItem.update({
      where: { id: actionId },
      data: {
        ...(title      !== undefined && { title }),
        ...(status     !== undefined && { status }),
        ...(priority   !== undefined && { priority }),
        ...(dueDate    !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(goalId     !== undefined && { goalId }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        goal:     { select: { id: true, title: true } },
      },
    })

    // Real-time emit
    const io = req.app.get('io')
    io.to(`workspace:${workspaceId}`).emit('action:updated', action)

    res.json({ action })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function deleteAction(req, res) {
  try {
    const { actionId, workspaceId } = req.params
    await prisma.actionItem.delete({ where: { id: actionId } })

    // Real-time emit
    const io = req.app.get('io')
    io.to(`workspace:${workspaceId}`).emit('action:deleted', { id: actionId })

    res.json({ message: 'Action deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}