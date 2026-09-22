import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "cn"
import { TriangleAlertIcon } from "lucide-react"
import * as React from "react"

export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={cn("border-0 p-0", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export interface EmptyErrorStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  className?: string
}

export function EmptyErrorState({
  icon = <TriangleAlertIcon />,
  title,
  description,
  className,
}: EmptyErrorStateProps) {
  return (
    <Empty className={cn("border-0 p-0", className)}>
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-destructive/10 text-destructive"
        >
          {icon}
        </EmptyMedia>
        <EmptyTitle className="text-destructive">{title}</EmptyTitle>
        <EmptyDescription className="text-destructive/80">
          {description}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export interface EmptyLoadingStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function EmptyLoadingState({
  icon = <Spinner />,
  title = "Loading…",
  description = "Please wait a moment.",
  className,
}: EmptyLoadingStateProps) {
  return (
    <Empty className={cn("border-0 p-0", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
