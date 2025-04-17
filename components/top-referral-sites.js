"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { Slider } from "@/components/ui/slider"

export default function TopReferralSites({ data }) {
  const [topN, setTopN] = useState(10)

  // Get top N sources
  const topSources = data.slice(0, topN)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-semibold">{payload[0].payload.source}</p>
          <p className="text-sm">
            <span className="font-medium">Sessions:</span> {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Top {topN} Referral Sources</label>
          <Slider value={[topN]} min={5} max={30} step={1} onValueChange={(value) => setTopN(value[0])} />
        </div>
        <div className="text-sm text-gray-500">
          Showing top {topN} of {data.length} sources
        </div>
      </div>

      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topSources} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, "auto"]} />
            <YAxis
              type="category"
              dataKey="source"
              width={90}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => (value.length > 12 ? `${value.substring(0, 12)}...` : value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sessions" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={30}>
              <LabelList dataKey="sessions" position="right" fill="#374151" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
