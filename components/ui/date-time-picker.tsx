"use client"

import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DateTimePickerProps {
  dateId: string
  timeId: string
  dateLabel?: string
  timeLabel?: string
  value?: Date
  onChange: (value: Date | undefined) => void
  disabled?: boolean
}

function applyTime(base: Date, time: string): Date {
  const [hours = "0", minutes = "0", seconds = "0"] = time.split(":")
  const next = new Date(base)
  next.setHours(
    Number(hours) || 0,
    Number(minutes) || 0,
    Number(seconds) || 0,
    0
  )
  return next
}

export function DateTimePicker({
  dateId,
  timeId,
  dateLabel = "Date",
  timeLabel = "Time",
  value,
  onChange,
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const timeValue = value ? format(value, "HH:mm:ss") : ""

  return (
    <FieldGroup className="flex-row items-end gap-3">
      <Field>
        <FieldLabel className="sr-only" htmlFor={dateId}>
          {dateLabel}
        </FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              id={dateId}
              disabled={disabled}
              className="w-40 justify-between font-normal"
            >
              {value ? format(value, "PPP") : "Select date"}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              defaultMonth={value}
              onSelect={(date) => {
                if (!date) {
                  onChange(undefined)
                  setOpen(false)
                  return
                }
                onChange(
                  value ? applyTime(date, timeValue || "00:00:00") : date
                )
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field className="w-32">
        <FieldLabel className="sr-only" htmlFor={timeId}>
          {timeLabel}
        </FieldLabel>
        <Input
          type="time"
          id={timeId}
          step="1"
          value={timeValue}
          disabled={disabled || !value}
          onChange={(event) => {
            if (!value) return
            onChange(applyTime(value, event.target.value || "00:00:00"))
          }}
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </Field>
    </FieldGroup>
  )
}
