"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { MOCK_SIX_MONTH_SERIES } from "@/lib/dashboard/mock"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

const chartConfig = {
  videos: {
    label: "Videos",
    color: "var(--chart-1)",
  },
  confidential: {
    label: "Confidential",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartAreaSixMonths() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Videos over time</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          initialDimension={{ width: 640, height: 250 }}
        >
          <AreaChart
            data={[...MOCK_SIX_MONTH_SERIES]}
            margin={{ left: 8, right: 8 }}
          >
            <defs>
              <linearGradient id="fillVideos" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-videos)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-videos)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillConfidential" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-confidential)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-confidential)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="videos"
              type="natural"
              fill="url(#fillVideos)"
              stroke="var(--color-videos)"
            />
            <Area
              dataKey="confidential"
              type="natural"
              fill="url(#fillConfidential)"
              stroke="var(--color-confidential)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
