// Import required components and icons
import LogoSvg from '@/components/global/logo-svg';
import Link from 'next/link';
import { Box, Settings, Users } from 'react-feather';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { HomeIcon } from 'lucide-react';
import SettingDialog from './setting-dialog';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { BookOpen } from 'react-feather';

// Navigation items configuration
export const navItem = [
  {
    name: 'Overview',
    href: '/',
    svg: <HomeIcon className='size-5' />,
  },
  {
    name: 'Metrics',
    href: '/metrics/',
    svg: <Box className='size-5' />,
  },
  {
    name: 'Team',
    href: '/team/',
    svg: <Users className='size-5' />,
  },
];

// Main dashboard navigation component
export default function DashboardNavbar() {
  return (
    <div className='flex h-screen flex-col py-[15px] pl-5'>
      {/* Logo/Home link */}
      <Link href='https://measurely.dev'>
        <div className='flex size-[45px] min-h-[45px] min-w-[45px] items-center justify-center rounded-[12px] border border-input/75'>
          <LogoSvg className='size-[30px] dark:invert' />
        </div>
      </Link>

      {/* Main navigation items */}
      <div className='flex h-full flex-col gap-[16px] pt-[30px]'>
        {navItem.map((item, i) => {
          return (
            <NavItem name={item.name} href={item.href} key={i}>
              {item.svg}
            </NavItem>
          );
        })}
      </div>

      {/* Bottom section with additional items and settings */}
      <div className='flex flex-col gap-[16px]'>
        <ItemChip />
        <Separator className='mx-auto w-6' />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <SettingDialog>
              <TooltipTrigger>
                <div
                  className={`flex h-[40px] min-h-[40px] w-[45px] min-w-[45px] items-center justify-center rounded-[12px] border border-transparent bg-background text-[20px] text-muted-foreground hover:border-input hover:bg-accent hover:text-primary`}
                >
                  <Settings className='size-5' />
                </div>
              </TooltipTrigger>
            </SettingDialog>
            <TooltipContent
              side='right'
              sideOffset={8}
              className='rounded-[6px] border bg-accent p-1 px-2 text-xs font-medium text-primary'
            >
              Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// Individual navigation item component with tooltip
function NavItem(props: { children: ReactNode; name: string; href: string }) {
  const pathname = usePathname();

  // Normalize paths by removing trailing slashes for comparison
  const normalizedPathname = pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
  const normalizedHref = props.href.endsWith('/')
    ? props.href.slice(0, -1)
    : props.href;

  // Determine if current item is active
  const isActive =
    normalizedPathname === normalizedHref ||
    (normalizedHref === '/metrics' &&
      normalizedPathname.startsWith('/metrics'));

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Link href={props.href}>
            <div
              className={`flex h-[40px] min-h-[40px] w-[45px] min-w-[45px] items-center justify-center rounded-[12px] border text-[20px] ${
                isActive
                  ? 'border-input bg-accent/75'
                  : 'border-transparent bg-background text-muted-foreground hover:bg-accent'
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

// Additional navigation items component (e.g., Documentation)
function ItemChip() {
  const itemList = [
    {
      label: 'Documentation',
      href: 'https://measurely.dev/docs',
      icon: <BookOpen className='size-[18px]' />,
    },
  ];

  return (
    <div className='flex w-[45px] min-w-[45px] flex-col gap-[6px] rounded-[16px] border bg-accent p-1'>
      {itemList.map((item, i) => {
        return (
          <ChipItem label={item.label} key={i} href={item.href}>
            {item.icon}
          </ChipItem>
        );
      })}
    </div>
  );
}

// Individual chip item component with tooltip
function ChipItem(props: { children: ReactNode; label: string; href: string }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Link href={props.href} target='_blank'>
            <div
              className={`flex items-center justify-center rounded-[12px] py-1.5 text-[20px] text-muted-foreground transition-all duration-200 hover:bg-background hover:text-primary`}
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
          {props.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
