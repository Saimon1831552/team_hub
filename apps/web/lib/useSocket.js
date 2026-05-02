'use client'
import { useEffect } from 'react'
import { socket } from '@/lib/socket'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import { useGoalStore } from '@/store/goalStore'
import { useActionStore } from '@/store/actionStore'

export function useSocket() {
  const current = useWorkspaceStore((s) => s.current)
  const user = useAuthStore((s) => s.user)
  const setOnlineUsers = useWorkspaceStore((s) => s.setOnlineUsers)
  const { addGoal, updateGoal, removeGoal } = useGoalStore()
  const { addAction, updateAction, removeAction } = useActionStore()

  useEffect(() => {
    if (!current || !user) return

    socket.connect()
    socket.emit('join-workspace', current.id)
    socket.emit('user-online', { userId: user.id, workspaceId: current.id })

    socket.on('online-users',     (users)      => setOnlineUsers(users))
    socket.on('goal:new',         (goal)       => addGoal(goal))
    socket.on('goal:updated',     (goal)       => updateGoal(goal.id, goal))
    socket.on('goal:deleted',     ({ id })     => removeGoal(id))
    socket.on('action:new',       (action)     => addAction(action))
    socket.on('action:updated',   (action)     => updateAction(action.id, action))
    socket.on('action:deleted',   ({ id })     => removeAction(id))

    return () => {
      socket.off('online-users')
      socket.off('goal:new')
      socket.off('goal:updated')
      socket.off('goal:deleted')
      socket.off('action:new')
      socket.off('action:updated')
      socket.off('action:deleted')
      socket.disconnect()
    }
  }, [current, user])
}