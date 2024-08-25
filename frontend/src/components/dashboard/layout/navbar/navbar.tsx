import LogoSvg from '@/components/global/logoSvg';
import Link from 'next/link';
import {
  BarChart,
  Box,
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
      name: 'Metrics',
      href: '/dashboard/[team]/projects',
      svg: <Box className='size-5' />,
    },
    {
      name: 'Payment',
      href: '/dashboard/[team]/payment',
      svg: <CreditCard className='size-5' />,
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
    </div>
  );
}
