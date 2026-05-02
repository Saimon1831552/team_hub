import prisma from '../lib/prisma.js'

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const avatarUrl = req.file.path

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarUrl },
      select: { id: true, name: true, email: true, avatar: true },
    })

    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Upload failed' })
  }
}