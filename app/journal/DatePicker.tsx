import React from 'react';
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

interface DatePickerButtonProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const DatePickerButton: React.FC<DatePickerButtonProps> = ({ selectedDate, onDateSelect }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal w-[240px]",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(new Date(selectedDate), 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={new Date(selectedDate)}
          onSelect={(date) => onDateSelect(format(date || new Date(), 'yyyy-MM-dd'))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePickerButton;