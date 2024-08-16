'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TeamContext } from '@/contexts/teamContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useContext, useEffect, useState } from 'react';

export default function DashboardNavItem(props: {
  children: ReactNode;
  name: string;
  href: string;
}) {
  const pathname = usePathname();
  const { teams } = useContext(TeamContext);

  const [match, setMatch] = useState<boolean>(false);

  useEffect(() => {
    const pathname_parts = pathname.split('/').filter((part) => part !== '');
    const href_parts = props.href.split('/').filter((part) => part !== '');

    for (let i = 0; i < href_parts.length; i++) {
      if (href_parts[i] === '[team]') {
        href_parts[i] = teams.list[teams.activeTeam].identifier;
      }
    }

    let match_value = true;
    const length =
      href_parts.length > pathname_parts.length
        ? href_parts.length
        : pathname_parts.length;
    for (let i = 0; i < length; i++) {
      if (pathname_parts[i] !== href_parts[i]) {
        match_value = false;
      }
    }

    setMatch(match_value);
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Link
            href={props.href.replace(
              '[team]',
              teams.list[teams.activeTeam].identifier
            )}
          >
            <div
              className={`flex h-[40px] min-h-[40px] w-[45px] min-w-[45px] items-center justify-center rounded-[12px] border text-[20px] ${match ? 'bg-accent/75' : 'border-transparent bg-background hover:bg-accent/50'}`}
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
