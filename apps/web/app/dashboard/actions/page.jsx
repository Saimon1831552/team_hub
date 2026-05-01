'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useActionStore } from '@/store/actionStore'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-gray-100' },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-blue-50' },
  { id: 'done',        label: 'Done',         color: 'bg-green-50' },
]

const PRIORITY_COLORS = {
  low:    'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100 text-red-700',
}

export default function ActionsPage() {
  const current = useWorkspaceStore((s) => s.current)
  const { actions, setActions, addAction, updateAction, removeAction } = useActionStore()
  const [view, setView] = useState('kanban')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '', status: 'todo' })

  useEffect(() => {
    if (!current) return
    async function load() {
      try {
        const res = await api.get(`/api/workspaces/${current.id}/actions`)
        setActions(res.data.actions)
      } catch {
        toast.error('Failed to load actions')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [current])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      const res = await api.post(`/api/workspaces/${current.id}/actions`, form)
      addAction(res.data.action)
      setForm({ title: '', priority: 'medium', dueDate: '', status: 'todo' })
      setShowForm(false)
      toast.success('Action created!')
    } catch {
      toast.error('Failed to create action')
    }
  }

  async function handleDragEnd(result) {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId

    // Optimistic update
    updateAction(draggableId, { status: newStatus })

    try {
      await api.put(`/api/workspaces/${current.id}/actions/${draggableId}`, { status: newStatus })
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this action?')) return
    try {
      await api.delete(`/api/workspaces/${current.id}/actions/${id}`)
      removeAction(id)
      toast.success('Action deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const getByStatus = (status) => actions.filter((a) => a.status === status)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Items</h1>
          <p className="text-gray-500 mt-1">{actions.length} total actions</p>
        </div>
        <div className="flex gap-3">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 text-sm ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            + New Action
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold mb-4">Create Action Item</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              required
              placeholder="Action title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-4">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-6 py-2 rounded-lg text-sm border border-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : view === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className={`${col.color} rounded-xl p-4`}>
                <h3 className="font-semibold text-gray-700 mb-3">
                  {col.label}
                  <span className="ml-2 text-xs bg-white px-2 py-0.5 rounded-full">
                    {getByStatus(col.id).length}
                  </span>
                </h3>
                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-24">
                      {getByStatus(col.id).map((action, index) => (
                        <Draggable key={action.id} draggableId={action.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white rounded-lg p-3 shadow-sm"
                            >
                              <p className="text-sm font-medium text-gray-900">{action.title}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[action.priority]}`}>
                                  {action.priority}
                                </span>
                                <button onClick={() => handleDelete(action.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                              </div>
                              {action.dueDate && (
                                <p className="text-xs text-gray-400 mt-1">📅 {new Date(action.dueDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">Title</th>
                <th className="text-left px-4 py-3 text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-gray-600">Priority</th>
                <th className="text-left px-4 py-3 text-gray-600">Due Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{action.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{action.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${PRIORITY_COLORS[action.priority]}`}>{action.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(action.id)} className="text-red-400 hover:text-red-600">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {actions.length === 0 && (
            <div className="text-center py-12 text-gray-400">No actions yet</div>
          )}
        </div>
      )}
    </div>
  )
}