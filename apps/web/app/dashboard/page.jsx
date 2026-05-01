'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import api from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const current = useWorkspaceStore((s) => s.current)
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!current) return
    async function load() {
      try {
        const res = await api.get(`/api/workspaces/${current.id}/analytics/stats`)
        setStats(res.data.stats)
        setChartData(res.data.chartData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [current])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">{current?.name} — overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Goals"        value={stats?.totalGoals}        color="text-indigo-600" icon="🎯" />
        <StatCard label="Active Goals"       value={stats?.activeGoals}       color="text-blue-600"   icon="🔵" />
        <StatCard label="Done This Week"     value={stats?.completedThisWeek} color="text-green-600"  icon="✅" />
        <StatCard label="Overdue Actions"    value={stats?.overdueActions}    color="text-red-600"    icon="⚠️" />
        <StatCard label="Total Actions"      value={stats?.totalActions}      color="text-purple-600" icon="📋" />
        <StatCard label="Completed Goals"    value={stats?.completedGoals}    color="text-green-600"  icon="🏆" />
        <StatCard label="Team Members"       value={stats?.totalMembers}      color="text-orange-600" icon="👥" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Goal Completions — Last 6 Months</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}