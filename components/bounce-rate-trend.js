"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BounceRateTrend({ data }) {
  const [timeFrame, setTimeFrame] = useState("all")

  // Group data by week to reduce clutter
  const groupedByWeek = {}
  data.forEach((item) => {
    // Extract date components (MM/DD/YY)
    const [month, day, year] = item.date.split("/").map(Number)

    // Create a date object
    const dateObj = new Date(2000 + year, month - 1, day)

    // Get week number (approximate by dividing day of year by 7)
    const start = new Date(dateObj.getFullYear(), 0, 0)
    const diff = dateObj - start
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)
    const weekNum = Math.floor(dayOfYear / 7)

    // Create a week identifier (YYYY-WW)
    const weekId = `${dateObj.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`

    // Format for display (MM/DD - MM/DD)
    const weekStart = new Date(dateObj)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const formatDate = (date) =>
      `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`
    const displayDate = `${formatDate(weekStart)}-${formatDate(weekEnd)}`

    if (!groupedByWeek[weekId]) {
      groupedByWeek[weekId] = {
        weekId,
        date: displayDate,
        bounceRate: 0,
        bounces: 0,
        sessions: 0,
        count: 0,
        timestamp: dateObj.getTime(), // For sorting
      }
    }

    groupedByWeek[weekId].bounces += Number(item.bounces) || 0
    groupedByWeek[weekId].sessions += Number(item.sessions) || 0
    groupedByWeek[weekId].count += 1
  })

  // Convert to array and calculate averages
  const weeklyData = Object.values(groupedByWeek)
    .map((week) => {
      const avgBounceRate = week.sessions > 0 ? (week.bounces / week.sessions) * 100 : 0

      return {
        ...week,
        bounceRate: Number.parseFloat(avgBounceRate.toFixed(2)),
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)

  // Calculate overall average for reference line
  const avgBounceRate = weeklyData.reduce((sum, item) => sum + item.bounceRate, 0) / weeklyData.length

  // Filter data based on selected time frame
  let filteredData = weeklyData
  if (timeFrame === "last12") {
    filteredData = weeklyData.slice(-12)
  } else if (timeFrame === "last6") {
    filteredData = weeklyData.slice(-6)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { date, bounceRate, bounces, sessions } = payload[0].payload
      return (
        <div className="p-3 border rounded shadow-md bg-white">
          <p className="font-semibold">{date}</p>
          <p className="text-sm">
            <span className="font-medium">Bounce Rate:</span> {bounceRate.toFixed(2)}%
          </p>
          <p className="text-sm">
            <span className="font-medium">Bounces:</span> {bounces}
          </p>
          <p className="text-sm">
            <span className="font-medium">Sessions:</span> {sessions}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="last12">Last 12 Weeks</SelectItem>
            <SelectItem value="last6">Last 6 Weeks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 30, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              padding={{ left: 20, right: 20 }}
              interval={Math.ceil(filteredData.length / 15)} // Show fewer ticks for readability
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{
                value: "Bounce Rate (%)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
                offset: -10,
              }}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine
              y={avgBounceRate}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{
                value: `Avg: ${avgBounceRate.toFixed(2)}%`,
                position: "insideLeft",
                fill: "#94a3b8",
                fontSize: 12,
                offset: 10,
              }}
            />
            <Line
              name="Weekly Bounce Rate"
              type="monotone"
              dataKey="bounceRate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
