'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useGoalStore } from '@/store/goalStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

function MilestoneSection({ goal, workspaceId, onMilestoneUpdate }) {
  const [milestones, setMilestones] = useState(goal.milestones || [])
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [open, setOpen] = useState(false)

  async function handleAddMilestone(e) {
    e.preventDefault()
    try {
      const res = await api.post(
        `/api/workspaces/${workspaceId}/goals/${goal.id}/milestones`,
        { title: newTitle, progress: 0 }
      )
      const updated = [...milestones, res.data.milestone]
      setMilestones(updated)
      onMilestoneUpdate(goal.id, updated)
      setNewTitle('')
      setShowAdd(false)
      toast.success('Milestone added!')
    } catch {
      toast.error('Failed to add milestone')
    }
  }

  async function handleProgressChange(milestoneId, progress) {
    try {
      const res = await api.put(
        `/api/workspaces/${workspaceId}/goals/${goal.id}/milestones/${milestoneId}`,
        { progress: Number(progress) }
      )
      const updated = milestones.map((m) =>
        m.id === milestoneId ? res.data.milestone : m
      )
      setMilestones(updated)
      onMilestoneUpdate(goal.id, updated)
    } catch {
      toast.error('Failed to update milestone')
    }
  }

  async function handleDeleteMilestone(milestoneId) {
    try {
      await api.delete(
        `/api/workspaces/${workspaceId}/goals/${goal.id}/milestones/${milestoneId}`
      )
      const updated = milestones.filter((m) => m.id !== milestoneId)
      setMilestones(updated)
      onMilestoneUpdate(goal.id, updated)
      toast.success('Milestone deleted')
    } catch {
      toast.error('Failed to delete milestone')
    }
  }

  const avgProgress = milestones.length
    ? Math.round(milestones.reduce((a, m) => a + m.progress, 0) / milestones.length)
    : 0

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-indigo-600 transition w-full text-left"
      >
        🏁 {open ? 'Hide' : 'Show'} Milestones ({milestones.length})
        {milestones.length > 0 && (
          <span className="ml-2 text-indigo-500 font-medium">{avgProgress}% avg</span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {milestones.length === 0 ? (
            <p className="text-xs text-gray-400">No milestones yet</p>
          ) : (
            milestones.map((m) => (
              <div key={m.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 flex-1 mr-2">
                    {m.title}
                  </span>
                  <span className="text-xs text-indigo-600 font-medium w-8 text-right">
                    {m.progress}%
                  </span>
                  <button
                    onClick={() => handleDeleteMilestone(m.id)}
                    className="text-xs text-red-300 hover:text-red-500 ml-2"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={m.progress}
                    onChange={(e) => handleProgressChange(m.id, e.target.value)}
                    className="w-20 accent-indigo-600"
                  />
                </div>
              </div>
            ))
          )}

          {/* Add milestone */}
          {showAdd ? (
            <form onSubmit={handleAddMilestone} className="flex gap-2 mt-2">
              <input
                required
                placeholder="Milestone title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-700"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-gray-400 px-2 text-xs"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="text-xs text-indigo-500 hover:text-indigo-700 mt-1"
            >
              + Add Milestone
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal, workspaceId, onUpdate, onDelete, onMilestoneUpdate }) {
  const statusColors = {
    active:    'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    paused:    'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1 mr-2">{goal.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusColors[goal.status]}`}>
          {goal.status}
        </span>
      </div>

      {goal.description && (
        <p className="text-sm text-gray-500 mb-3">{goal.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>👤 {goal.owner?.name}</span>
        {goal.dueDate && (
          <span>📅 {new Date(goal.dueDate).toLocaleDateString()}</span>
        )}
      </div>

      {/* Status change + delete */}
      <div className="flex items-center gap-2">
        <select
          value={goal.status}
          onChange={(e) => onUpdate(goal.id, { status: e.target.value })}
          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-xs text-red-400 hover:text-red-600 ml-auto"
        >
          Delete
        </button>
      </div>

      {/* Milestones */}
      <MilestoneSection
        goal={goal}
        workspaceId={workspaceId}
        onMilestoneUpdate={onMilestoneUpdate}
      />
    </div>
  )
}

export default function GoalsPage() {
  const current = useWorkspaceStore((s) => s.current)
  const { goals, setGoals, addGoal, updateGoal, removeGoal } = useGoalStore()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'active',
  })

  useEffect(() => {
    if (!current) return
    async function load() {
      try {
        const res = await api.get(`/api/workspaces/${current.id}/goals`)
        setGoals(res.data.goals)
      } catch {
        toast.error('Failed to load goals')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [current])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      const res = await api.post(`/api/workspaces/${current.id}/goals`, form)
      addGoal(res.data.goal)
      setForm({ title: '', description: '', dueDate: '', status: 'active' })
      setShowForm(false)
      toast.success('Goal created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal')
    }
  }

  async function handleUpdate(id, data) {
    // Optimistic update
    updateGoal(id, data)
    try {
      const res = await api.put(`/api/workspaces/${current.id}/goals/${id}`, data)
      updateGoal(id, res.data.goal)
      toast.success('Goal updated!')
    } catch {
      toast.error('Failed to update goal')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this goal?')) return
    try {
      await api.delete(`/api/workspaces/${current.id}/goals/${id}`)
      removeGoal(id)
      toast.success('Goal deleted')
    } catch {
      toast.error('Failed to delete goal')
    }
  }

  function handleMilestoneUpdate(goalId, milestones) {
    updateGoal(goalId, { milestones })
  }

  const filtered = filter === 'all'
    ? goals
    : goals.filter((g) => g.status === filter)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-500 mt-1">{goals.length} total goals</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New Goal
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'completed', 'paused'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold mb-4">Create Goal</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              required
              placeholder="Goal title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
            <div className="flex gap-4">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 px-6 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🎯</p>
          <p>No goals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              workspaceId={current?.id}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMilestoneUpdate={handleMilestoneUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}