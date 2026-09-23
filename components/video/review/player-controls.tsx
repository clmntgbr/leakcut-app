import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-react"

export interface PlayerControlsProps {
  playing: boolean
  canGoPrevious: boolean
  canGoNext: boolean
  blur: boolean
  onTogglePlay: () => void
  onPrevious: () => void
  onNext: () => void
  onBlurChange: (blur: boolean) => void
}

export function PlayerControls({
  playing,
  canGoPrevious,
  canGoNext,
  blur,
  onTogglePlay,
  onPrevious,
  onNext,
  onBlurChange,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Previous frame"
        disabled={!canGoPrevious}
        onClick={onPrevious}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={playing ? "Pause" : "Play"}
        onClick={onTogglePlay}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Next frame"
        disabled={!canGoNext}
        onClick={onNext}
      >
        <ChevronRightIcon />
      </Button>
      <Label className="ms-auto flex cursor-pointer items-center gap-1.5 text-xs font-normal text-muted-foreground">
        <Checkbox
          checked={blur}
          onCheckedChange={(checked) => onBlurChange(checked === true)}
        />
        Flouter
      </Label>
    </div>
  )
}
