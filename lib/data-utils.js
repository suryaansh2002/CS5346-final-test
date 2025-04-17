import Papa from "papaparse"

export async function fetchAndProcessData() {
  try {
    const response = await fetch(
      "https://jocular-elf-5018aa.netlify.app/TEST_DATASET.csv",
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          try {
            const data = results.data.filter(
              (row) =>
                row["Channel Grouping"] &&
                row["Date"] &&
                row["Source"] &&
                row["Bounces"] &&
                row["Sessions"] &&
                row["Time on Page"] &&
                row["PageViews"] &&
                row["Page Title"],
            )

            // Process data for each query
            const referralData = processReferralData(data)
            const channelData = processChannelData(data)
            const contentQualityData = processContentQualityData(data)
            const bounceRateData = processBounceRateData(data)

            resolve({
              referralData,
              channelData,
              contentQualityData,
              bounceRateData,
            })
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(error)
        },
      })
    })
  } catch (error) {
    console.error("Error fetching or parsing data:", error)
    throw error
  }
}

// Query 1: Top Referral Sites Analysis
function processReferralData(data) {
  // Filter for 2018 data
  // const data2018 = data.filter((row) => {
  //   const dateStr = row["Date"]
  //   // Check if date contains 2018
  //   return dateStr && dateStr.includes("2018")
  // })

  // Aggregate sessions by source
  const sourceMap = {}
  data.forEach((row) => {
    const source = row["Source"]
    const sessions = Number.parseInt(row["Sessions"]) || 0

    if (source) {
      if (!sourceMap[source]) {
        sourceMap[source] = 0
      }
      sourceMap[source] += sessions
    }
  })

  // Convert to array and sort by sessions
  const sortedSources = Object.entries(sourceMap)
    .map(([source, sessions]) => ({ source, sessions }))
    .sort((a, b) => b.sessions - a.sessions)

  return sortedSources
}

// Query 2: Channel Contribution to Sessions
function processChannelData(data) {
  // Aggregate sessions by channel
  const channelMap = {}
  let totalSessions = 0

  data.forEach((row) => {
    const channel = row["Channel Grouping"]
    const sessions = Number.parseInt(row["Sessions"]) || 0

    if (channel) {
      if (!channelMap[channel]) {
        channelMap[channel] = 0
      }
      channelMap[channel] += sessions
      totalSessions += sessions
    }
  })

  // Calculate percentages and convert to array
  const channelData = Object.entries(channelMap).map(([channel, sessions]) => ({
    channel,
    sessions,
    percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
  }))

  return channelData
}

// Query 3: Page Content Quality Analysis
function processContentQualityData(data) {
  // Aggregate time on page and pageviews by page title
  const pageMap = {}

  data.forEach((row) => {
    const pageTitle = row["Page Title"]
    const timeOnPage = Number.parseFloat(row["Time on Page"]) || 0
    const pageViews = Number.parseInt(row["PageViews"]) || 0

    if (pageTitle && pageViews > 0) {
      if (!pageMap[pageTitle]) {
        pageMap[pageTitle] = { totalTime: 0, totalViews: 0 }
      }
      pageMap[pageTitle].totalTime += timeOnPage
      pageMap[pageTitle].totalViews += pageViews
    }
  })

  // Calculate average time on page
  const pageData = Object.entries(pageMap)
    .map(([pageTitle, { totalTime, totalViews }]) => ({
      pageTitle,
      avgTimeOnPage: totalViews > 0 ? totalTime / totalViews : 0,
    }))
    .filter((item) => item.avgTimeOnPage > 0)
    .sort((a, b) => b.avgTimeOnPage - a.avgTimeOnPage)
    .slice(0, 20) // Limit to top 20 for better visualization

  return pageData
}

// Query 5: Time-Series Analysis of Bounce Rate
function processBounceRateData(data) {
  // Aggregate bounces and sessions by date
  const dateMap = {}

  data.forEach((row) => {
    const date = row["Date"]
    const bounces = Number.parseInt(row["Bounces"]) || 0
    const sessions = Number.parseInt(row["Sessions"]) || 0

    if (date && sessions > 0) {
      if (!dateMap[date]) {
        dateMap[date] = { bounces: 0, sessions: 0 }
      }
      dateMap[date].bounces += bounces
      dateMap[date].sessions += sessions
    }
  })

  // Calculate bounce rate and convert to array
  const bounceRateData = Object.entries(dateMap)
    .map(([date, { bounces, sessions }]) => {
      const bounceRate = sessions > 0 ? (bounces / sessions) * 100 : 0
      return {
        date,
        bounceRate: Number.parseFloat(bounceRate.toFixed(2)),
        bounces,
        sessions,
        isOutlier: false, // Will be set later
      }
    })
    .sort((a, b) => {
      // Sort by date (assuming MM/DD/YY format)
      const [aMonth, aDay, aYear] = a.date.split("/").map(Number)
      const [bMonth, bDay, bYear] = b.date.split("/").map(Number)

      if (aYear !== bYear) return aYear - bYear
      if (aMonth !== bMonth) return aMonth - bMonth
      return aDay - bDay
    })

  // Calculate average bounce rate
  const avgBounceRate = bounceRateData.reduce((sum, item) => sum + item.bounceRate, 0) / bounceRateData.length

  // Mark outliers (>50% deviation from average)
  bounceRateData.forEach((item) => {
    const deviation = Math.abs(item.bounceRate - avgBounceRate) / avgBounceRate
    item.isOutlier = deviation > 0.5
  })

  return bounceRateData
}
