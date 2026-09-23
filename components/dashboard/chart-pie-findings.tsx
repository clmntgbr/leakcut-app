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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { MOCK_FINDING_MIX } from "@/lib/dashboard/mock"
import { Label, Pie, PieChart } from "recharts"

const chartConfig = {
  value: { label: "Videos" },
  clean: { label: "Clean", color: "var(--chart-1)" },
  personal: { label: "Personal data", color: "var(--chart-2)" },
  confidential: { label: "Confidential", color: "var(--chart-3)" },
  keys: { label: "Keys / IBAN / cards", color: "var(--chart-4)" },
} satisfies ChartConfig

const chartData = MOCK_FINDING_MIX.map((item) => ({
  ...item,
  fill: `var(--color-${item.name})`,
}))

const totalVideos = MOCK_FINDING_MIX.reduce((sum, item) => sum + item.value, 0)

export function ChartPieFindings() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Finding mix</CardTitle>
        <CardDescription>Share of reviewed videos</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
          initialDimension={{ width: 250, height: 250 }}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox)) return null
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalVideos}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 22}
                        className="fill-muted-foreground text-xs"
                      >
                        Videos
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
            <ChartLegend
              content={
                <ChartLegendContent
                  nameKey="name"
                  className="-translate-y-2 flex-wrap gap-2 *:justify-center"
                />
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
