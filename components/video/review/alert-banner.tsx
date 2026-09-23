import { Alert, AlertTitle } from "@/components/ui/alert"
import { TriangleAlertIcon } from "lucide-react"

export function AlertBanner({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <Alert variant="destructive" className="px-2.5 py-1.5 text-xs">
      <TriangleAlertIcon />
      <AlertTitle className="text-xs font-medium">
        À vérifier avant publication
      </AlertTitle>
    </Alert>
  )
}
