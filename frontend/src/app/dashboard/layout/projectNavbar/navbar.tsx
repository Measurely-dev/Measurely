'use client';
import { TeamContext } from '@/contexts/teamContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

export default function ProjectNavbar() {
  const pathname = usePathname();
  const { teams } = useContext(TeamContext);
  const tabs = [
    {
      label: 'Overview',
      href: '/dashboard/[team]/projects/[project]',
    },
    {
      label: 'Messages',
      href: '/dashboard/[team]/projects/[project]/messages',
    },
    {
      label: 'Tickets',
      href: '/dashboard/[team]/projects/[project]/tickets',
    },
    {
      label: 'Vault',
      href: '/dashboard/[team]/projects/[project]/vault',
    },
    {
      label: 'Invoices',
      href: '/dashboard/[team]/projects/[project]/invoices',
    },
    {
      label: 'Settings',
      href: '/dashboard/[team]/projects/[project]/settings',
    },
  ];

  return (
    <div className='flex w-fit flex-row gap-2 rounded-[12px] bg-accent p-[4px]'>
      {tabs.map((tab, i) => {
        const [match, setMatch] = useState<boolean>(false);

        useEffect(() => {
          const pathname_parts = pathname
            .split('/')
            .filter((part) => part !== '');
          const href_parts = tab.href.split('/').filter((part) => part !== '');

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
          <Link
            href={tab.href
              .replace('[team]', teams.list[teams.activeTeam].identifier)
              .replace(
                '[project]',
                teams.list[teams.activeTeam].projects.list[teams.activeProject]
                  .identifier
              )}
            key={i}
          >
            <div
              className={`rounded-[10px] px-6 py-1 text-sm font-medium transition-all duration-200 ${match ? 'bg-background text-primary' : 'text-secondary hover:bg-background/70'}`}
            >
              {tab.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
