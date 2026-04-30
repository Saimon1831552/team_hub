import prisma from '../lib/prisma.js'

export async function createAnnouncement(req, res) {
  try {
    const { workspaceId } = req.params
    const { content } = req.body

    if (!content) return res.status(400).json({ message: 'Content is required' })

    const announcement = await prisma.announcement.create({
      data: { content, workspaceId },
      include: {
        reactions: true,
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    })

    res.status(201).json({ announcement })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getAnnouncements(req, res) {
  try {
    const { workspaceId } = req.params

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.userId, workspaceId } },
    })
    if (!member) return res.status(403).json({ message: 'Access denied' })

    const announcements = await prisma.announcement.findMany({
      where: { workspaceId },
      include: {
        reactions: true,
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })

    res.json({ announcements })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const { announcementId } = req.params
    const { content } = req.body

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: { content },
    })

    res.json({ announcement })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const { announcementId } = req.params
    await prisma.announcement.delete({ where: { id: announcementId } })
    res.json({ message: 'Announcement deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function pinAnnouncement(req, res) {
  try {
    const { announcementId } = req.params

    const current = await prisma.announcement.findUnique({
      where: { id: announcementId },
    })

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: { pinned: !current.pinned },
    })

    res.json({ announcement })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function addReaction(req, res) {
  try {
    const { announcementId } = req.params
    const { emoji } = req.body

    if (!emoji) return res.status(400).json({ message: 'Emoji is required' })

    // Toggle — remove if already reacted with same emoji
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_announcementId_emoji: {
          userId: req.userId,
          announcementId,
          emoji,
        },
      },
    })

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } })
      return res.json({ message: 'Reaction removed' })
    }

    const reaction = await prisma.reaction.create({
      data: { emoji, userId: req.userId, announcementId },
    })

    res.status(201).json({ reaction })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function addComment(req, res) {
  try {
    const { announcementId } = req.params
    const { content } = req.body

    if (!content) return res.status(400).json({ message: 'Content is required' })

    const comment = await prisma.comment.create({
      data: { content, userId: req.userId, announcementId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    res.status(201).json({ comment })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getComments(req, res) {
  try {
    const { announcementId } = req.params

    const comments = await prisma.comment.findMany({
      where: { announcementId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json({ comments })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}