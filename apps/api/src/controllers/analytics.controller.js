import prisma from '../lib/prisma.js'

export async function getDashboardStats(req, res) {
  try {
    const { workspaceId } = req.params

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.userId, workspaceId } },
    })
    if (!member) return res.status(403).json({ message: 'Access denied' })

    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

    const [
      totalGoals,
      completedGoals,
      activeGoals,
      totalActions,
      completedThisWeek,
      overdueActions,
      totalMembers,
    ] = await Promise.all([
      prisma.goal.count({ where: { workspaceId } }),
      prisma.goal.count({ where: { workspaceId, status: 'completed' } }),
      prisma.goal.count({ where: { workspaceId, status: 'active' } }),
      prisma.actionItem.count({ where: { workspaceId } }),
      prisma.actionItem.count({
        where: {
          workspaceId,
          status: 'done',
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.actionItem.count({
        where: {
          workspaceId,
          status: { not: 'done' },
          dueDate: { lt: now },
        },
      }),
      prisma.workspaceMember.count({ where: { workspaceId } }),
    ])

    // Goal completion over last 6 months for chart
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1)

      const count = await prisma.goal.count({
        where: {
          workspaceId,
          status: 'completed',
          createdAt: { gte: start, lt: end },
        },
      })

      months.push({
        month: start.toLocaleString('default', { month: 'short' }),
        completed: count,
      })
    }

    res.json({
      stats: {
        totalGoals,
        completedGoals,
        activeGoals,
        totalActions,
        completedThisWeek,
        overdueActions,
        totalMembers,
      },
      chartData: months,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function exportCSV(req, res) {
  try {
    const { workspaceId } = req.params

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.userId, workspaceId } },
    })
    if (!member) return res.status(403).json({ message: 'Access denied' })

    const [goals, actions] = await Promise.all([
      prisma.goal.findMany({
        where: { workspaceId },
        include: { owner: { select: { name: true } } },
      }),
      prisma.actionItem.findMany({
        where: { workspaceId },
        include: { assignee: { select: { name: true } } },
      }),
    ])

    const goalRows = goals.map(g =>
      `${g.id},${g.title},${g.status},${g.owner.name},${g.dueDate || ''},${g.createdAt}`
    )

    const actionRows = actions.map(a =>
      `${a.id},${a.title},${a.status},${a.priority},${a.assignee?.name || ''},${a.dueDate || ''},${a.createdAt}`
    )

    const csv = [
      'GOALS',
      'id,title,status,owner,dueDate,createdAt',
      ...goalRows,
      '',
      'ACTION ITEMS',
      'id,title,status,priority,assignee,dueDate,createdAt',
      ...actionRows,
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=workspace-${workspaceId}.csv`)
    res.send(csv)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}