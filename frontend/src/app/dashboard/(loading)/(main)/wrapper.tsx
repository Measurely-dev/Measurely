'use client';

import DashboardContent from '@/components/dashboard/content';
import DashboardNavbar from '@/components/dashboard/navbar';
import DashboardTopbar from '@/components/dashboard/topbar/topbar';
import { ScrollArea } from '@/components/ui/scroll-area';
export default function DashboardWrapper({ children }: { children: any }) {
  return (
    <div className='flex flex-row items-center gap-[40px] overflow-x-hidden pr-[5px]'>
      <div className='max-md:hidden'>
        <DashboardNavbar />
      </div>
      <div className='w-full pl-[20px]'>
        <DashboardContent>
          <DashboardTopbar />
          <div className='flex min-h-[calc(100vh-15px)] pt-[50px] flex-col'>
            {children}
          </div>
        </DashboardContent>
      </div>
    </div>
  );
}
