import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckIcon } from 'lucide-react';

export default function Card1(props: { className?: string }) {
  return (
    <Card className={`w-[320px] rounded-2xl p-0 shadow-sm ${props.className}`}>
      <div className='absolute bottom-[-10px] left-[-10px] z-10 flex size-8 items-center justify-center rounded-[10px] border bg-zinc-300/30 font-mono text-sm text-blue-400 backdrop-blur-md'>
        +1
      </div>
      <div className='absolute flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-300/15 text-sm text-blue-400 backdrop-blur-md'>
        <div className='flex aspect-square h-[60px] items-center justify-center rounded-full border border-blue-400 bg-blue-400/10 text-blue-400'>
          <CheckIcon className='size-8 !stroke-[1]' />
        </div>
        Metric created
      </div>
      <CardHeader className='flex flex-row items-center p-5'>
        <div className='flex w-full flex-col gap-1'>
          <span className='text-xs text-secondary'>
            • Created March 30, 2024
          </span>
          <span className='text-xl font-semibold'>New users</span>
        </div>
        <div className='flex aspect-square h-[40px] items-center justify-center rounded-full border border-green-400 bg-green-400/10 text-green-400'>
          <CheckIcon className='size-6' />
        </div>
      </CardHeader>
      <Separator className='w-full' />
      <CardContent className='flex flex-col p-5'>
        <span className='text-sm'>Metric description</span>
        <span className='mt-1 text-xs text-secondary'>
          Introducing our cutting-edge Client Portal Software, a revolutionary
          SaaS application designed specifically for modern Design and Creative
        </span>
      </CardContent>
    </Card>
  );
}
