"use client";

import DashboardContent from "@/components/dashboard/layout/content/content";
import DashboardNavbar from "@/components/dashboard/layout/navbar/navbar";
import DashboardTopbar from "@/components/dashboard/layout/topbar/topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
export default function DashboardWrapper({ children }: { children: any }) {
  return (
    <div className="flex flex-row items-center gap-[40px] overflow-x-hidden pr-[5px]">
      <>
        <DashboardNavbar />
        <DashboardContent>
          <DashboardTopbar />
          <ScrollArea className="flex h-[calc(100vh-15px-50px)] min-h-[600px] flex-col">
            {children}
          </ScrollArea>
        </DashboardContent>
      </>
      {/* <div className='absolute left-0 top-0 flex h-[100vh] w-[100vw] select-none flex-col items-center justify-center gap-8 bg-accent'>
          <div className='relative flex items-center justify-center gap-2'>
            <LogoSvg className='size-14' />
            <div className='text-xl font-semibold'>Zway</div>
          </div>
          <div className='w-[250px] rounded-full bg-input'>
            <Progress className='h-1' />
          </div>
        </div> */}
    </div>
  );
}
