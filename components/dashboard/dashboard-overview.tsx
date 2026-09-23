import { ChartAreaSixMonths } from "@/components/dashboard/chart-area-six-months"
import { ChartPieFindings } from "@/components/dashboard/chart-pie-findings"
import { SectionCards } from "@/components/dashboard/section-cards"

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-4 pt-4 md:gap-6 md:pt-6">
      <SectionCards />
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ChartPieFindings />
        <ChartAreaSixMonths />
      </div>
    </div>
  )
}
