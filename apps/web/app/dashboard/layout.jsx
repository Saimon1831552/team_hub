'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useSocket } from '@/lib/useSocket'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const { user, setUser, clearUser } = useAuthStore()
  const { workspaces, current, onlineUsers, setWorkspaces, setCurrent } = useWorkspaceStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [members, setMembers] = useState([])

  useSocket()

  useEffect(() => {
    async function init() {
      try {
        const res = await api.get('/api/auth/me')
        setUser(res.data.user)
        const wsRes = await api.get('/api/workspaces')
        const list = wsRes.data.workspaces
        setWorkspaces(list)
        if (list.length > 0) setCurrent(list[0])
      } catch {
        router.push('/login')
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!current) return
    async function loadMembers() {
      try {
        const res = await api.get(`/api/workspaces/${current.id}/members`)
        setMembers(res.data.members)
      } catch {}
    }
    loadMembers()
  }, [current])

  async function handleLogout() {
    await api.post('/api/auth/logout')
    clearUser()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard',              label: 'Dashboard',     icon: '📊' },
    { href: '/dashboard/goals',        label: 'Goals',         icon: '🎯' },
    { href: '/dashboard/actions',      label: 'Actions',       icon: '✅' },
    { href: '/dashboard/announcements',label: 'Announcements', icon: '📢' },
    { href: '/dashboard/members',      label: 'Members',       icon: '👥' },
    { href: '/dashboard/profile',      label: 'Profile',       icon: '👤' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>

        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <span className="text-xl font-bold text-indigo-600">Team Hub</span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-100">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Workspace selector */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Workspace</p>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={current?.id || ''}
              onChange={(e) => {
                const ws = workspaces.find((w) => w.id === e.target.value)
                setCurrent(ws)
              }}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
            <button
              onClick={() => router.push('/dashboard/workspaces/new')}
              className="mt-2 w-full text-xs text-indigo-600 hover:underline text-left"
            >
              + New Workspace
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Online members */}
        {sidebarOpen && onlineUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">
              Online — {onlineUsers.length}
            </p>
            <div className="space-y-1">
              {members
                .filter((m) => onlineUsers.includes(m.userId))
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="relative">
                      {m.user?.avatar ? (
                        <img src={m.user.avatar} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                          {m.user?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                    </div>
                    <span className="text-xs text-gray-600 truncate">{m.user?.name}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* User */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-green-500 font-medium">● Online</p>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-xs">
                Exit
              </button>
            </div>
          ) : (
            <div className="relative mx-auto w-8 h-8">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}