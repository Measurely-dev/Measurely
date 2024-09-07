import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { MoreHorizontal } from 'react-feather';
import DashSeparator from './seperator';
import Link from 'next/link';

export default function MetricInfo({ metrics }: { metrics: any }) {
  console.log(metrics);
  return (
    <Card className='flex h-full w-[375px] min-w-[375px] max-w-[375px] flex-col gap-5 rounded-2xl border-none bg-accent p-7'>
      <div className='flex h-full flex-col gap-5'>
        {/* Title and icon */}
        <div className='flex flex-row items-center justify-between'>
          <div className='flex flex-row items-center gap-2'>

            <div className='text-base font-medium'>{metrics.name}</div>
          </div>
          <Button
            className='rounded-[12px] !bg-background hover:opacity-80'
            variant='secondary'
            size='icon'
          >
            <MoreHorizontal />
          </Button>
        </div>
        {/* Description */}
        <div className='my-[10px] text-xs text-secondary'>
          {metrics.description}
        </div>
        {/* Separator */}
        <DashSeparator>Properities</DashSeparator>
        
        {/* Separator */}
        <DashSeparator>Client information</DashSeparator>

        {metrics.client_connected ? (
          <>
            {/* Separator */}
            <DashSeparator>Invoice information</DashSeparator>
            {/* Input 3 */}
            <Label className='flex flex-col gap-2'>
              Invoice reccurence
              <Select defaultValue='week'>
                <SelectTrigger>
                  <SelectValue placeholder='Select a reccurence' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='day'>Each day</SelectItem>
                    <SelectItem value='week'>Each week</SelectItem>
                    <SelectItem value='month'>Each month</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          </>
        ) : (
          'No client connected'
        )}
      </div>
      <Link
        href={`/dashboard/${metrics.identifier}/projects/${metrics.identifier}/`}
      >
        <Button className='rounded-[12px] text-sm'>View</Button>
      </Link>
    </Card>
  );
}
