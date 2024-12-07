'use client';
import { ChartsCard } from '@/components/dashboard/components/chartsCard';
import MetricStats from '@/components/dashboard/components/metricStats';
import DashboardContentContainer from '@/components/dashboard/container/container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function DashboardHomePage() {
  return (
    <DashboardContentContainer className='mt-0 flex w-full pb-[15px] pt-[15px]'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className='pointer-events-none'>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Project stats */}
      <MetricStats
        className='mt-5'
        stats={[
          {
            title: 'Number of metric',
            description: 'Across this application',
            value: '+25',
          },
          {
            title: 'Number of dual metric',
            description: 'Across this application',
            value: '+13',
          },
          {
            title: 'Number of basic metric',
            description: 'Across this application',
            value: '+12',
          },
          {
            title: 'Team members',
            description: 'Accros this application',
            value: '1',
          },
        ]}
      />
      {/* Charts card (2 charts) */}
      <ChartsCard />
    </DashboardContentContainer>
  );
}
