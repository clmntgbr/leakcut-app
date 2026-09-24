import type { CSSProperties } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { RiskGroupScore } from "@/lib/video/findings"

export interface RiskPanelProps {
  scores: RiskGroupScore[]
  formats: string[]
  ocrText: string
  frameName: string | null
}

export function RiskPanel({
  scores,
  formats,
  ocrText,
  frameName,
}: RiskPanelProps) {
  return (
    <Card size="sm" className="h-full gap-2 py-3">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium">Ce que juge jev</CardTitle>
        {frameName ? (
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {frameName}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {scores.map((score) => (
          <div key={score.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{score.label}</span>
              <span className="font-medium tabular-nums">{score.value}%</span>
            </div>
            <Progress
              value={score.value}
              className="h-1.5"
              style={
                { "--progress-color": score.color } as CSSProperties
              }
            />
          </div>
        ))}

        <div className="pt-1">
          <p className="mb-1.5 text-xs text-muted-foreground">
            Formats sensibles repérés
          </p>
          {formats.length === 0 ? (
            <p className="text-xs text-muted-foreground/70">Aucun</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {formats.map((format) => (
                <Badge
                  key={format}
                  variant="outline"
                  className="text-[10px] font-normal"
                >
                  {format}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="pt-1">
          <p className="mb-1.5 text-xs text-muted-foreground">Texte OCR</p>
          {ocrText !== "" ? (
            <p className="max-h-28 overflow-auto whitespace-pre-wrap text-xs leading-relaxed break-words">
              {ocrText}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/70">Aucun</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
