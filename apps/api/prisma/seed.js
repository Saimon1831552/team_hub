import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  const password = await bcrypt.hash('demo1234', 10)

  // Demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@teamhub.com' },
    update: {},
    create: { email: 'demo@teamhub.com', password, name: 'Demo User' },
  })

  // Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace-id' },
    update: {},
    create: {
      id: 'demo-workspace-id',
      name: 'Demo Workspace',
      description: 'A demo workspace to explore Team Hub',
      accentColor: '#6366f1',
      members: {
        create: { userId: user.id, role: 'Admin' },
      },
    },
  })

  // Goals
  const goal = await prisma.goal.create({
    data: {
      title: 'Launch Team Hub v1',
      description: 'Ship the first production version',
      status: 'active',
      dueDate: new Date('2026-06-30'),
      ownerId: user.id,
      workspaceId: workspace.id,
      milestones: {
        create: [
          { title: 'Backend API complete', progress: 100 },
          { title: 'Frontend pages done', progress: 80 },
          { title: 'Deploy to Railway', progress: 20 },
        ],
      },
    },
  })

  // Action items
  await prisma.actionItem.createMany({
    data: [
      { title: 'Set up monorepo', status: 'done', priority: 'high', workspaceId: workspace.id, goalId: goal.id },
      { title: 'Build auth system', status: 'done', priority: 'high', workspaceId: workspace.id, goalId: goal.id },
      { title: 'Deploy to Railway', status: 'in_progress', priority: 'high', workspaceId: workspace.id, goalId: goal.id },
      { title: 'Write README', status: 'todo', priority: 'medium', workspaceId: workspace.id },
      { title: 'Record demo video', status: 'todo', priority: 'medium', workspaceId: workspace.id },
    ],
  })

  // Announcement
  await prisma.announcement.create({
    data: {
      content: '🎉 Welcome to Team Hub! This is your collaborative workspace. Create goals, track actions, and stay in sync with your team.',
      pinned: true,
      workspaceId: workspace.id,
    },
  })

  console.log('✅ Seed complete!')
  console.log('Demo account: demo@teamhub.com / demo1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())