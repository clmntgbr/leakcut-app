"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RISK_GROUP_META, type TimelinePoint } from "@/lib/video/findings"
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts"

const chartConfig = {
  personal: {
    label: RISK_GROUP_META.personal.label,
    color: RISK_GROUP_META.personal.color,
  },
  confidential: {
    label: RISK_GROUP_META.confidential.label,
    color: RISK_GROUP_META.confidential.color,
  },
  keys: {
    label: RISK_GROUP_META.keys.label,
    color: RISK_GROUP_META.keys.color,
  },
} satisfies ChartConfig

export interface RiskTimelineChartProps {
  data: TimelinePoint[]
  currentTimeMs: number
  durationMs: number
  onSeek: (timeMs: number) => void
}

export function RiskTimelineChart({
  data,
  currentTimeMs,
  durationMs,
  onSeek,
}: RiskTimelineChartProps) {
  const maxTime = Math.max(data.at(-1)?.timeMs ?? 0, durationMs, 1)

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">Risque au fil de la vidéo</p>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto! h-32 w-full"
        initialDimension={{ width: 640, height: 128 }}
      >
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          onClick={(state) => {
            const label = state?.activeLabel
            const timeMs =
              typeof label === "number" ? label : Number(label)
            if (Number.isFinite(timeMs)) onSeek(timeMs)
          }}
        >
          <XAxis
            dataKey="timeMs"
            type="number"
            domain={[0, maxTime]}
            tickFormatter={(ms) => `${Math.round(Number(ms) / 1000)}s`}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            width={28}
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const timeMs = payload?.[0]?.payload?.timeMs
                  if (typeof timeMs !== "number") return ""
                  return `${Math.round(timeMs / 1000)}s`
                }}
                formatter={(value) =>
                  typeof value === "number" ? `${Math.round(value)}%` : value
                }
              />
            }
          />
          <Area
            type="stepAfter"
            dataKey="personal"
            fill="var(--color-personal)"
            stroke="var(--color-personal)"
            fillOpacity={0.15}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="stepAfter"
            dataKey="confidential"
            fill="var(--color-confidential)"
            stroke="var(--color-confidential)"
            fillOpacity={0.15}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="stepAfter"
            dataKey="keys"
            fill="var(--color-keys)"
            stroke="var(--color-keys)"
            fillOpacity={0.15}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <ReferenceLine
            x={currentTimeMs}
            stroke="var(--foreground)"
            strokeWidth={1}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
