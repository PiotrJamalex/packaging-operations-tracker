
import React, { useState } from 'react';
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FormField from './FormField';

interface DateTimeFieldProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  id: string;
  className?: string;
  minDate?: Date;
}

const DateTimeField: React.FC<DateTimeFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  id, 
  className,
  minDate 
}) => {
  const [time, setTime] = useState(value ? format(value, 'HH:mm') : '');

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }

    // If time is set, combine date with time
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      date.setHours(hours || 0, minutes || 0);
    }

    onChange(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (value) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours || 0, minutes || 0);
      onChange(newDate);
    }
  };

  return (
    <FormField
      label={label}
      htmlFor={id}
      className={className}
    >
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full focus:ring-2 focus:ring-primary/25",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                format(value, 'd MMM yyyy', { locale: pl })
              ) : (
                <span>Wybierz datę</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 bg-white/95 backdrop-blur-sm border border-border/50" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              initialFocus
              locale={pl}
              className={cn("p-3 pointer-events-auto")}
              disabled={minDate ? (date) => date < minDate : undefined}
            />
          </PopoverContent>
        </Popover>

        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id={`${id}-time`}
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="pl-10 focus:ring-2 focus:ring-primary/25"
          />
        </div>
      </div>
    </FormField>
  );
};

export default DateTimeField;
