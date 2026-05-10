"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-8 text-xs",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DatePickerInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  className,
  disabled,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false)
  
  const date = value ? new Date(value) : undefined
  
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Format as YYYY-MM-DD for input value
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      onChange?.(`${year}-${month}-${day}`)
    } else {
      onChange?.("")
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-8 text-xs",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-3 bg-popover border rounded-lg shadow-lg" 
        align="start"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="bg-transparent"
          classNames={{
            months: "flex flex-col space-y-3",
            month: "space-y-3",
            caption: "flex justify-center pt-0 relative items-center px-7 h-7",
            caption_label: "text-xs font-medium text-foreground",
            nav: "space-x-1 flex items-center",
            nav_button: "h-6 w-6 bg-transparent hover:bg-accent hover:text-accent-foreground rounded flex items-center justify-center transition-colors",
            nav_button_previous: "absolute left-0",
            nav_button_next: "absolute right-0",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded w-7 font-normal text-[11px] flex items-center justify-center h-6",
            row: "flex w-full mt-0.5",
            cell: "h-7 w-7 text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l last:[&:has([aria-selected])]:rounded-r focus-within:relative focus-within:z-20",
            day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-medium shadow-sm",
            day_today: "bg-accent text-accent-foreground font-medium",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
