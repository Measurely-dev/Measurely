'use client';
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
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
export default function TeamPage() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    document.title = 'Team | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Collaborate with your team on Measurely. Manage roles, share insights, and work together to track and analyze metrics effectively.',
      );
    }
  }, []);
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
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();

              if (process.env.NEXT_PUBLIC_ENV !== 'production') {
                return;
              }

              const requested =
                window.localStorage.getItem('request-team-feature') === 'true'
                  ? true
                  : false;
              if (requested) {
                toast.success('Thank you for your feedback');
                return;
              }

              setLoading(true);
              fetch(
                `https://api.measurely.dev/event/${process.env.NEXT_PUBLIC_MEASURELY_API_KEY}/99b449d0-8af6-4c83-b357-2f61bdf4c301`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ value: 1 }),
                },
              ).finally(() => {
                setLoading(false);
                window.localStorage.setItem('request-team-feature', 'true');
                toast.success('Thank you for your feedback');
              });
            }}
          >
            <Button
              className='mx-auto mb-10 mt-4 w-fit rounded-xl'
              type='submit'
              loading={loading}
              disabled={loading}
            >
              Request feature
            </Button>
          </form>
        </div>
      </div>
    </DashboardContentContainer>
  );
}
