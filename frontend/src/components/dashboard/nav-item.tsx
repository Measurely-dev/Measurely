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

  const normalizedPathname = pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  const normalizedHref = props.href.endsWith('/')
    ? props.href.slice(0, -1)
    : props.href;

  const isActive =
    normalizedPathname === normalizedHref ||
    (normalizedHref === '/dashboard/metrics' &&
      normalizedPathname.startsWith('/dashboard/metrics'));

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Link href={props.href}>
            <div
              className={`flex h-[40px] min-h-[40px] w-[45px] min-w-[45px] items-center justify-center rounded-[12px] border text-[20px] ${
                isActive
                  ? 'border-input bg-accent/75'
                  : 'border-transparent bg-background text-secondary hover:bg-accent'
              }`}
            >
              {props.children}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side='right'
          sideOffset={8}
          className='rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary'
        >
          {props.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
