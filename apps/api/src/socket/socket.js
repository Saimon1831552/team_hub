const onlineUsers = new Map()

export function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`)
      socket.workspaceId = workspaceId
    })

    socket.on('user-online', ({ userId, workspaceId }) => {
      socket.userId = userId
      onlineUsers.set(userId, socket.id)
      io.to(`workspace:${workspaceId}`).emit('online-users',
        Array.from(onlineUsers.keys())
      )
    })

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId)
        if (socket.workspaceId) {
          io.to(`workspace:${socket.workspaceId}`).emit('online-users',
            Array.from(onlineUsers.keys())
          )
        }
      }
    })
  })
}

export function emitToWorkspace(io, workspaceId, event, data) {
  io.to(`workspace:${workspaceId}`).emit(event, data)
}