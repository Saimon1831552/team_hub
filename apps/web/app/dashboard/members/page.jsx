'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function MembersPage() {
  const current = useWorkspaceStore((s) => s.current)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Member')

  useEffect(() => {
    if (!current) return
    async function load() {
      try {
        const res = await api.get(`/api/workspaces/${current.id}/members`)
        setMembers(res.data.members)
      } catch {
        toast.error('Failed to load members')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [current])

  async function handleInvite(e) {
    e.preventDefault()
    try {
      const res = await api.post(`/api/workspaces/${current.id}/invite`, { email, role })
      setMembers([...members, res.data.member])
      setEmail('')
      toast.success('Member invited!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite')
    }
  }

  async function handleRemove(userId) {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/api/workspaces/${current.id}/members/${userId}`)
      setMembers(members.filter((m) => m.userId !== userId))
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Members</h1>

      {/* Invite form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold mb-4">Invite Member</h2>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Invite
          </button>
        </form>
      </div>

      {/* Members list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">Member</th>
                <th className="text-left px-4 py-3 text-gray-600">Role</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {m.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{m.user?.name}</p>
                        <p className="text-xs text-gray-400">{m.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.role !== 'Admin' && (
                      <button
                        onClick={() => handleRemove(m.userId)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}