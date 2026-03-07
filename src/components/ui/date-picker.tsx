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
    value?: string;
    onChange: (date: string) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ value, onChange, className, placeholder = "اختر التاريخ" }: DatePickerProps) {
    const dateObj = value ? new Date(value) : undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-right font-normal border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shadow-inner rounded-2xl hover:bg-white dark:hover:bg-slate-900 transition-all",
                        !dateObj && "text-muted-foreground",
                        className
                    )}
                    style={{ height: 'auto', padding: '0.875rem 1.5rem' }}
                >
                    <CalendarIcon className="mr-3 h-4 w-4 text-blue-500" />
                    <span className="text-[11px] font-bold dark:text-white">
                        {dateObj ? format(dateObj, "yyyy-MM-dd") : <span>{placeholder}</span>}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999] bg-white dark:bg-slate-900 rounded-[1.5rem] border-gray-200 dark:border-slate-800 shadow-xl" align="end">
                <Calendar
                    mode="single"
                    selected={dateObj}
                    onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))}
                    initialFocus
                    captionLayout="dropdown"
                    className="rounded-lg border-0"
                />
            </PopoverContent>
        </Popover>
    )
}
