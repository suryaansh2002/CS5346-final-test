"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

export default function PageContentQuality({ data }) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { pageTitle, avgTimeOnPage } = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow-md max-w-xs">
          <p className="font-semibold text-sm">{pageTitle}</p>
          <p className="text-sm">
            <span className="font-medium">Avg Time:</span> {avgTimeOnPage.toFixed(2)} seconds
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="pageTitle"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => (value.length > 20 ? `${value.substring(0, 20)}...` : value)}
          />
          <YAxis
            label={{
              value: "Average Time (seconds)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={25}
            stroke="#f43f5e"
            strokeDasharray="3 3"
            label={{
              value: "Benchmark (25s)",
              position: "insideLeft",
              fill: "#f43f5e",
              fontSize: 12,
              offset: 10, // Add offset to move text inside the chart
            }}
          />
          <Bar dataKey="avgTimeOnPage" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
