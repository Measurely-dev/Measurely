'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';

export function DatePicker(props: {
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  date: Date | undefined;
}) {
  return (
    <div className={'grid gap-2'}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            size={'icon'}
            variant={'secondary'}
            className={cn(
              'items-center justify-center rounded-[12px] font-normal',
              !props.date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className='size-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto rounded-[12px] bg-background p-0'
          align='start'
        >
          <div className='flex flex-col gap-1 px-4 pt-3'>
            <div className='text-sm font-semibold'>Offset</div>
          </div>
          <Calendar
            mode='single'
            selected={props.date}
            onSelect={props.setDate}
            initialFocus
            disabled={(date) =>
              date > new Date() || date < new Date('1900-01-01')
            }
          />
          <div className='w-full px-4 pb-3 text-sm text-secondary'>
            Select a date to offset the chart
            <br />
            <Link
              className='text-primary underline'
              href={'/docs/features/advanced-options'}
              target='_blank'
            >
              learn more
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
