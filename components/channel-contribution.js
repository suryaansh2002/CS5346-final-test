"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

export default function ChannelContribution({ data }) {
  // Sort data by sessions (descending)
  const sortedData = [...data].sort((a, b) => b.sessions - a.sessions)

  // Define colors for pie chart
  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
  ]

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { channel, sessions, percentage } = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-semibold">{channel}</p>
          <p className="text-sm">
            <span className="font-medium">Sessions:</span> {sessions.toLocaleString()}
          </p>
          <p className="text-sm">
            <span className="font-medium">Percentage:</span> {percentage.toFixed(2)}%
          </p>
        </div>
      )
    }
    return null
  }

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props

    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div className="w-3 h-3 mr-2" style={{ backgroundColor: entry.color }} />
            <span className="text-sm">
              {entry.value} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            innerRadius={60}
            fill="#8884d8"
            dataKey="sessions"
            nameKey="channel"
            label={({ channel, percentage }) => `${percentage.toFixed(1)}%`}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
