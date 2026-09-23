import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MOCK_DASHBOARD_CARDS } from "@/lib/dashboard/mock"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

export function SectionCards() {
  return (
    <section className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {MOCK_DASHBOARD_CARDS.map((card) => {
        const TrendIcon =
          card.trend === "up" ? TrendingUpIcon : TrendingDownIcon

        return (
          <Card key={card.id} className="@container/card">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon />
                  {card.delta}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.headline}
                <TrendIcon className="size-4" />
              </div>
              <p className="text-muted-foreground">{card.detail}</p>
            </CardFooter>
          </Card>
        )
      })}
    </section>
  )
}
