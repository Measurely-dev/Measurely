'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProjectNavbar() {
  const pathname = usePathname();
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
        return (
          <Link
            href={tab.href}
            key={i}
          >
            <div
              className={`rounded-[10px] px-6 py-1 text-sm font-medium transition-all duration-200 ${pathname === tab.label ? 'bg-background text-primary' : 'text-secondary hover:bg-background/70'}`}
            >
              {tab.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
