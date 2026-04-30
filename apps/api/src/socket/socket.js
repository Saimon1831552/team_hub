export function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`)
    })

    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}