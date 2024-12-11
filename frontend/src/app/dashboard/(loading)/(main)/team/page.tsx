import DashboardContentContainer from '@/components/dashboard/container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import WebChip from '@/components/website/chip';
import { Users } from 'lucide-react';
export default function TeamPage() {
  return (
    <DashboardContentContainer className='mt-0 flex h-[calc(100vh-15px-50px)] w-full pb-10 pt-[15px]'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className='pointer-events-none'>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Team</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='mx-auto mt-24 flex h-fit w-fit flex-col items-center justify-center gap-4'>
        <WebChip color='default'>Coming soon</WebChip>
        <div className='mb-4 flex aspect-[16/7] w-[100%] items-center justify-center rounded-xl border'>
          <Users className='size-[50%] p-0 text-black' />
        </div>
        <div className='flex flex-col gap-3 text-center'>
          <div className='text-lg font-semibold'>Team</div>
          <div className='max-w-[400px] text-sm text-secondary'>
            Collaborate with others by adding team members to your workspace.
            Stay tuned for this upcoming feature!
          </div>
          <Button className='mx-auto mb-10 mt-4 w-fit rounded-xl'>
            Request feature
          </Button>
        </div>
      </div>
    </DashboardContentContainer>
  );
}
