'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function DashboardNavItem(props: {
  children: ReactNode;
  name: string;
  href: string;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Link
            href={'/'}
          >
            <div
            // ${match ? 'bg-accent/75' : 'border-transparent bg-background hover:bg-accent/50'}
              className={`flex h-[40px] min-h-[40px] w-[45px] min-w-[45px] items-center justify-center rounded-[12px] border text-[20px] `}
            >
              {props.children}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side='right'
          sideOffset={8}
          className='rounded-[6px] border bg-accent p-1 px-2 text-xs font-medium text-primary'
        >
          {props.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
