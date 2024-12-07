'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Dispatch, SetStateAction } from 'react';

export function DatePicker(props : {date : DateRange | undefined, setDate : Dispatch<SetStateAction<DateRange | undefined>>}) {



  return (
    <div className={'grid gap-2'}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'secondary'}
            className={cn(
              'w-fit justify-start rounded-[12px] px-4 text-left font-normal',
              !props.date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className='mr-2 size-4' />
            {props.date?.from && props.date.to ? (
              <>
                {format(props.date.from, 'LLL dd, y')} -{' '}
                {format(props.date.to, 'LLL dd, y')}
              </>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto rounded-[12px] bg-background p-0'
          align='start'
        >
          <Calendar
            initialFocus
            mode='range'
            selected={props.date}
            onSelect={props.setDate}
            numberOfMonths={1}
            disabled={(date) =>
              date > new Date() || date < new Date('1900-01-01')
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
