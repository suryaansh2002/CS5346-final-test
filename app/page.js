"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import TopReferralSites from "@/components/top-referral-sites"
import ChannelContribution from "@/components/channel-contribution"
import PageContentQuality from "@/components/page-content-quality"
import BounceRateTrend from "@/components/bounce-rate-trend"
import { fetchAndProcessData } from "@/lib/data-utils"

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const processedData = await fetchAndProcessData()
        console.log(processedData)
        setData(processedData)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Google Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Insights from your web traffic data</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="referrals" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="referrals">Top Referrals</TabsTrigger>
            <TabsTrigger value="channels">Channel Contribution</TabsTrigger>
            <TabsTrigger value="content">Content Quality</TabsTrigger>
            <TabsTrigger value="bounce">Bounce Rate</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Query 1: Top Referral Sites Analysis</CardTitle>
                <CardDescription>Analyzing the top referral sources by sessions in 2018</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-[400px] w-full" />
                  </div>
                ) : (
                  <TopReferralSites data={data?.referralData || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card>
              <CardHeader>
                <CardTitle>Query 2: Channel Contribution to Sessions</CardTitle>
                <CardDescription>Percentage contribution of each channel to total sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[400px] w-full" />
                  </div>
                ) : (
                  <ChannelContribution data={data?.channelData || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Query 3: Page Content Quality Analysis</CardTitle>
                <CardDescription>Average time on page per content compared to 25s benchmark</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[400px] w-full" />
                  </div>
                ) : (
                  <PageContentQuality data={data?.contentQualityData || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bounce">
            <Card>
              <CardHeader>
                <CardTitle>Query 5: Time-Series Analysis of Bounce Rate</CardTitle>
                <CardDescription>Bounce rate trend over time with highlighted peaks and valleys</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[400px] w-full" />
                  </div>
                ) : (
                  <BounceRateTrend data={data?.bounceRateData || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
