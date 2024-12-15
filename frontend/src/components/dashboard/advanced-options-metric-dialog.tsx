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
import { Label } from '../ui/label';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';

export default function AdvancedOptionsMetricDialog(props: {
  children: ReactNode;
  chartType: string;
  setChartType: (value: any) => void;
  groupType: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='rounded-sm shadow-sm max-sm:px-2'>
        <DialogHeader className='static text-start'>
          <DialogTitle>Advanced options</DialogTitle>
          <DialogDescription>
            You can choose advanced options for the chart
          </DialogDescription>
          <DialogClose className='absolute right-5 top-3 max-sm:hidden'>
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
          <Label className='flex flex-row items-center justify-between'>
            <div className='flex flex-col gap-1'>
              Trend
              <div className='w-full text-sm text-secondary'>
                Switch on or off the trend{' '}
                <Link
                  className='text-primary underline'
                  href={'/docs/features/advanced-options'}
                  target='_blank'
                >
                  learn more
                </Link>
              </div>
            </div>
            <Switch id='airplane-mode' />
          </Label>
          {props.groupType === 0 ? (
            <></>
          ) : (
            <Label className='flex flex-col gap-2'>
              Chart type
              <Select
                value={props.chartType}
                onValueChange={(e) => props.setChartType(e)}
              >
                <SelectTrigger className='h-11 border'>
                  <SelectValue placeholder='Select a type of naming' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={'stacked'}>Stacked</SelectItem>
                    <SelectItem value={'percent'}>Percentage</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className='w-full text-sm text-secondary'>
                Select chart type{' '}
                <Link
                  className='text-primary underline'
                  href={'/docs/features/advanced-options'}
                  target='_blank'
                >
                  learn more
                </Link>
              </div>
            </Label>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
