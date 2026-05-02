import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { initSocket } from './socket/socket.js'
import authRoutes from './routes/auth.routes.js'
import workspaceRoutes from './routes/workspace.routes.js'
import goalRoutes from './routes/goal.routes.js'
import actionRoutes from './routes/action.routes.js'
import announcementRoutes from './routes/announcement.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import uploadRoutes from './routes/upload.routes.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.use(cookieParser())

app.set('io', io)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/workspaces/:workspaceId/goals', goalRoutes)
app.use('/api/workspaces/:workspaceId/actions', actionRoutes)
app.use('/api/workspaces/:workspaceId/announcements', announcementRoutes)
app.use('/api/workspaces/:workspaceId/analytics', analyticsRoutes)
app.use('/api/upload', uploadRoutes)

initSocket(io)

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})