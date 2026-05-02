'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const EMOJIS = ['👍', '❤️', '🎉', '🔥', '👏']

function CommentSection({ announcementId, workspaceId }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function loadComments() {
    try {
      const res = await api.get(
        `/api/workspaces/${workspaceId}/announcements/${announcementId}/comments`
      )
      setComments(res.data.comments)
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await api.post(
        `/api/workspaces/${workspaceId}/announcements/${announcementId}/comments`,
        { content: text }
      )
      setComments([...comments, res.data.comment])
      setText('')
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  function toggleOpen() {
    if (!open) loadComments()
    setOpen(!open)
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={toggleOpen}
        className="text-xs text-gray-400 hover:text-indigo-600 transition"
      >
        💬 {open ? 'Hide' : 'Show'} Comments
        {comments.length > 0 && ` (${comments.length})`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Comments list */}
          {comments.length === 0 ? (
            <p className="text-xs text-gray-400">No comments yet — be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0 mt-0.5">
                  {c.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {c.user?.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
              </div>
            ))
          )}

          {/* Comment input */}
          <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function AnnouncementsPage() {
  const current = useWorkspaceStore((s) => s.current)
  const user = useAuthStore((s) => s.user)
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
      const res = await api.post(
        `/api/workspaces/${current.id}/announcements`,
        { content }
      )
      setAnnouncements([res.data.announcement, ...announcements])
      setContent('')
      setShowForm(false)
      toast.success('Announcement posted!')
    } catch {
      toast.error('Failed to post')
    }
  }

  async function handleReaction(announcementId, emoji) {
    try {
      await api.post(
        `/api/workspaces/${current.id}/announcements/${announcementId}/reactions`,
        { emoji }
      )
      const res = await api.get(`/api/workspaces/${current.id}/announcements`)
      setAnnouncements(res.data.announcements)
    } catch {
      toast.error('Failed to react')
    }
  }

  async function handlePin(announcementId) {
    try {
      await api.patch(
        `/api/workspaces/${current.id}/announcements/${announcementId}/pin`
      )
      const res = await api.get(`/api/workspaces/${current.id}/announcements`)
      setAnnouncements(res.data.announcements)
      toast.success('Updated!')
    } catch {
      toast.error('Failed to pin')
    }
  }

  async function handleDelete(announcementId) {
    if (!confirm('Delete this announcement?')) return
    try {
      await api.delete(
        `/api/workspaces/${current.id}/announcements/${announcementId}`
      )
      setAnnouncements(announcements.filter((a) => a.id !== announcementId))
      toast.success('Deleted!')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">{announcements.length} total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Post
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold mb-4">New Announcement</h2>
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
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 px-6 py-2 rounded-lg text-sm border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements list */}
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
            <div
              key={a.id}
              className={`bg-white rounded-xl p-5 shadow-sm border ${
                a.pinned ? 'border-indigo-300' : 'border-gray-100'
              }`}
            >
              {/* Pin badge */}
              {a.pinned && (
                <span className="text-xs text-indigo-600 font-medium mb-2 block">
                  📌 Pinned
                </span>
              )}

              {/* Content */}
              <p className="text-gray-800 mb-2">{a.content}</p>
              <p className="text-xs text-gray-400 mb-3">
                {new Date(a.createdAt).toLocaleString()}
              </p>

              {/* Reactions */}
              <div className="flex items-center gap-2 flex-wrap">
                {EMOJIS.map((emoji) => {
                  const count = a.reactions?.filter((r) => r.emoji === emoji).length
                  const reacted = a.reactions?.some(
                    (r) => r.emoji === emoji && r.userId === user?.id
                  )
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(a.id, emoji)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition ${
                        reacted
                          ? 'bg-indigo-100 border-indigo-300'
                          : count > 0
                          ? 'bg-indigo-50 border-indigo-200'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {emoji}
                      {count > 0 && (
                        <span className="text-xs text-gray-600">{count}</span>
                      )}
                    </button>
                  )
                })}

                {/* Actions */}
                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={() => handlePin(a.id)}
                    className="text-xs text-gray-400 hover:text-indigo-600 transition"
                  >
                    {a.pinned ? '📌 Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Comments */}
              <CommentSection
                announcementId={a.id}
                workspaceId={current?.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}