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
import { Label } from '../ui/label';

export default function AdvancedOptionsMetricDialog(props: {
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='rounded-sm shadow-sm'>
        <DialogHeader className='static'>
          <DialogTitle>Advanced information</DialogTitle>
          <DialogDescription>
            You can see the data of a specific day here
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
          <DatePicker />
          <Label className='flex flex-col gap-1 mt-2'>
            Total
            <div className='font-mono text-xl'>21378123</div>
          </Label>
          <Label className='flex flex-col gap-1 mt-2'>
            Daily update
            <div className='font-mono text-xl'>+213982</div>
          </Label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
