'use client';

// Import dashboard components
import DashboardContent from '@/components/dashboard-content';
import DashboardNavbar from '@/components/navbar';
import DashboardTopbar from '@/components/topbar/dashboard-topbar';

// Main dashboard wrapper component that provides the layout structure
// Accepts children components to render within the dashboard
export default function DashboardWrapper({ children }: { children: any }) {
  return (
    // Main container with flex layout and scroll constraints
    <div className='flex max-h-screen flex-row items-center gap-[40px] overflow-x-hidden pr-[5px]'>
      {/* Navigation sidebar - hidden on mobile */}
      <div className='max-md:hidden'>
        <DashboardNavbar />
      </div>

      {/* Main content area */}
      <div className='w-full pl-[20px]'>
        <DashboardContent>
          {/* Top navigation bar */}
          <DashboardTopbar />

          {/* Scrollable content container */}
          <div className='flex max-h-[calc(100vh-15px)] flex-col overflow-y-scroll'>
            {children}
          </div>
        </DashboardContent>
      </div>
    </div>
  );
}
