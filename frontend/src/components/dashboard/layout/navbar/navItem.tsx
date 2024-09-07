'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function DashboardNavItem(props: {
  children: ReactNode;
  name: string;
  href: string;
}) {
  const pathname = usePathname();
  console.log(pathname)
  console.log(props.href)
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Link
            href={props.href}
          >
            <div
              className={`flex h-[40px] min-h-[40px] w-[45px] min-w-[45px] items-center justify-center rounded-[12px] border text-[20px] ${props.href === pathname ? 'bg-accent/75 border-input/30' : 'border-transparent text-secondary bg-background hover:bg-accent/50'}`}
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
