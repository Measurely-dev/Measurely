'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { DatePicker } from '../ui/date-picker';
import Link from 'next/link';

export default function AdvancedOptionsMetricDialog(props: {
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='rounded-sm shadow-sm'>
        <DialogHeader className='static'>
          <DialogTitle>Advanced options</DialogTitle>
          <DialogDescription>
            You can choose advanced options for the chart
          </DialogDescription>
          <DialogClose className='absolute right-5 top-3'>
            <Button
              type='button'
              size={'icon'}
              variant='secondary'
              className='rounded-[12px]'
            >
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className='flex w-full flex-col gap-4'>
          <div className='mt-2 flex flex-col gap-1'>
            <DatePicker />
            <div className='text-sm text-secondary'>
              You can select a date to offset the chart{' '}
              <Link
                className='text-primary underline'
                href={'/docs/getting-started/installation'}
              >
                learn more
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
