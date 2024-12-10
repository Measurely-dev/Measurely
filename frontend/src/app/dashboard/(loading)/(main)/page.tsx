'use client';
import { ChartsCard } from '@/components/dashboard/charts-card';
import DashboardContentContainer from '@/components/dashboard/container';
import UpgradeCard from '@/components/dashboard/upgrade-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { UserContext } from '@/dash-context';
import { useContext } from 'react';

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
      <UpgradeCard/>
      <ChartsCard />
    </DashboardContentContainer>
  );
}
