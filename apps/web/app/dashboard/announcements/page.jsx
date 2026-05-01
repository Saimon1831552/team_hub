'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const EMOJIS = ['👍', '❤️', '🎉', '🔥', '👏']

export default function AnnouncementsPage() {
  const current = useWorkspaceStore((s) => s.current)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!current) return
    async function load() {
      try {
        const res = await api.get(`/api/workspaces/${current.id}/announcements`)
        setAnnouncements(res.data.announcements)
      } catch {
        toast.error('Failed to load announcements')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [current])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      const res = await api.post(`/api/workspaces/${current.id}/announcements`, { content })
      setAnnouncements([res.data.announcement, ...announcements])
      setContent('')
      setShowForm(false)
      toast.success('Announcement posted!')
    } catch {
      toast.error('Failed to post announcement')
    }
  }

  async function handleReaction(announcementId, emoji) {
    try {
      await api.post(`/api/workspaces/${current.id}/announcements/${announcementId}/reactions`, { emoji })
      const res = await api.get(`/api/workspaces/${current.id}/announcements`)
      setAnnouncements(res.data.announcements)
    } catch {
      toast.error('Failed to react')
    }
  }

  async function handlePin(announcementId) {
    try {
      await api.patch(`/api/workspaces/${current.id}/announcements/${announcementId}/pin`)
      const res = await api.get(`/api/workspaces/${current.id}/announcements`)
      setAnnouncements(res.data.announcements)
      toast.success('Updated!')
    } catch {
      toast.error('Failed to pin')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Post
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <textarea
              required
              placeholder="Write your announcement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Post</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-6 py-2 rounded-lg text-sm border border-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📢</p>
          <p>No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className={`bg-white rounded-xl p-5 shadow-sm border ${a.pinned ? 'border-indigo-300' : 'border-gray-100'}`}>
              {a.pinned && (
                <span className="text-xs text-indigo-600 font-medium mb-2 block">📌 Pinned</span>
              )}
              <p className="text-gray-800 mb-3">{a.content}</p>
              <p className="text-xs text-gray-400 mb-3">{new Date(a.createdAt).toLocaleString()}</p>

              {/* Reactions */}
              <div className="flex items-center gap-2 flex-wrap">
                {EMOJIS.map((emoji) => {
                  const count = a.reactions?.filter((r) => r.emoji === emoji).length
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(a.id, emoji)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition ${count > 0 ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      {emoji} {count > 0 && <span className="text-xs">{count}</span>}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePin(a.id)}
                  className="ml-auto text-xs text-gray-400 hover:text-indigo-600"
                >
                  {a.pinned ? 'Unpin' : 'Pin'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}