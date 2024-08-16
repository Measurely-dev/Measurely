import LogoSvg from '@/components/global/logoSvg';
import Link from 'next/link';
import {
  BarChart,
  CreditCard,
  List,
  Plus,
  Settings,
  Users,
} from 'react-feather';
import DashboardNavItem from './navItem';

export default function DashboardNavbar() {
  const navItem = [
    {
      name: 'Overview',
      href: '/dashboard/[team]',
      svg: <BarChart className='size-5' />,
    },
    {
      name: 'Projects',
      href: '/dashboard/[team]/projects',
      svg: <List className='size-5' />,
    },
    {
      name: 'Payment',
      href: '/dashboard/[team]/payment',
      svg: <CreditCard className='size-5' />,
    },
    {
      name: 'Members',
      href: '/dashboard/[team]/members',
      svg: <Users className='size-5' />,
    },
    {
      name: 'Settings',
      href: '/dashboard/[team]/settings',
      svg: <Settings className='size-5' />,
    },
  ];
  return (
    <div className='flex h-screen flex-col py-[15px] pl-5'>
      <Link href='/'>
        <div className='flex size-[45px] min-h-[45px] min-w-[45px] items-center justify-center rounded-[12px] border'>
          <LogoSvg className='size-[30px]' />
        </div>
      </Link>
      <div className='flex h-full flex-col gap-[16px] pt-[30px]'>
        {navItem.map((item, i) => {
          return (
            <DashboardNavItem name={item.name} href={item.href} key={i}>
              {item.svg}
            </DashboardNavItem>
          );
        })}
      </div>
      <div className='flex h-[40px] min-h-[40px] w-[45px] min-w-[45px] cursor-pointer items-center justify-center rounded-[12px] border text-secondary transition-all duration-200 hover:bg-accent/75'>
        <Plus className='size-5' />
      </div>
    </div>
  );
}
