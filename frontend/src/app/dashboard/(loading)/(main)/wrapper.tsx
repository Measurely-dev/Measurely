'use client';

import DashboardContent from '@/components/dashboard/content';
import DashboardNavbar from '@/components/dashboard/navbar';
import DashboardTopbar from '@/components/dashboard/topbar/topbar';
export default function DashboardWrapper({ children }: { children: any }) {
  return (
    <div className='flex max-h-screen flex-row items-center gap-[40px] overflow-x-hidden pr-[5px]'>
      <div className='max-md:hidden'>
        <DashboardNavbar />
      </div>
      <div className='w-full pl-[20px]'>
        <DashboardContent>
          <DashboardTopbar />
          <div className='flex flex-col max-h-[calc(100vh-15px)] overflow-y-scroll bg-blue-500'>
            {children}
          </div>
        </DashboardContent>
      </div>
    </div>
  );
}
