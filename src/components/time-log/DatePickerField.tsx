"use client";

import { CalendarIcon } from "lucide-react";
import { formatDate, parseUserDate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const date = value ? parseUserDate(value) ?? undefined : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left text-sm font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-1.5 size-3.5" />
          {date ? formatDate(date) : "Pick date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) onChange(formatDate(d));
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
