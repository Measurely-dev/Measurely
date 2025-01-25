'use client';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import Link from 'next/link';
import { ChevronRight } from 'react-feather';

export default function LandingSection(props: {
  type: 'default' | 'waitlist';
}) {
  return (
    <>
      <div className='flex h-[90vh] min-h-[500px] w-screen flex-col items-center justify-center gap-5 text-center'>
        <Link
          href={'/blog/1'}
          className='group flex cursor-pointer select-none flex-row items-center gap-3 rounded-full border border-input bg-accent p-0.5 pr-1 text-sm shadow-sm shadow-black/5 transition-all duration-200 hover:shadow-black/10 max-sm:scale-90'
        >
          <div className='rounded-full border bg-background px-3 py-1'>
            <span className='font-mono'>Open Source</span>
          </div>
          <span className='flex w-[110px] flex-row items-center justify-between gap-2 pr-2 transition-all duration-200 group-hover:pr-1'>
            Learn more <MoveRight className='size-4' />
          </span>
        </Link>
        <h1 className='inline-flex flex-col text-[4.3rem] font-medium leading-tight max-lg:text-[3rem] max-md:text-[2rem]'>
          Track all your metrics <br />
          <span className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text text-transparent'>
            In one powerful platform
          </span>
        </h1>

        <div className='text-md inline-flex w-[95%] flex-col font-medium max-md:text-sm max-sm:text-[13px]'>
          <span>Measurely is an open source analytics platform.</span>
          <span>
            Start tracking with real-time metrics, API integrations,
            customizable
            <br /> blocks, data visualizations, and powerful team collaboration
            tools.
          </span>
        </div>
        <div className='mt-4 flex gap-2'>
          <Link href={props.type === 'waitlist' ? '/waitlist' : '/register'}>
          <Button className='rounded-[12px]'>
            {props.type === 'waitlist' ? 'Join wailist' : 'Start tracking'}
          </Button>
          </Link>
          <Link href={'/docs/getting-started/introduction'}>
            <Button variant={'outline'} className='rounded-[12px]'>
              Read docs
              <ChevronRight className='ml-2 size-4' />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
