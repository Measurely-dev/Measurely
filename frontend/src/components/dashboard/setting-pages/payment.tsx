'use client';
import React, { FormEvent, useContext, useState } from 'react';
import SettingCard from '../setting-card';
import { Button } from '@/components/ui/button';
import PlansDialog from '../plans-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AppsContext, UserContext } from '@/dash-context';
import MetricStats from '../metric-stats';
import { Rocket } from 'lucide-react';

const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};

export default function SettingPaymentPage() {
  const [loadingBilling, setLoadingBilling] = useState(false);
  const router = useRouter();
  const { user } = useContext(UserContext);

  const { projects, activeProject } = useContext(AppsContext);

  const handleManageBilling = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingBilling(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) {
          return resp.json();
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
          setLoadingBilling(false);
        }
      })
      .then((data) => {
        if (data !== null && data !== undefined) {
          toast.success('Opening billing portal...');
          setTimeout(() => router.push(data.url), 500);
        }
      });
  };

  return (
    <div className='flex flex-col'>
      <div
        className={`flex w-full flex-row items-center justify-between rounded-[12px] rounded-b-none px-5 py-3 max-md:flex-col max-md:gap-4 ${user?.plan.identifier === 'starter' ? 'bg-accent' : 'animate-gradient bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white'}`}
      >
        <div className='flex flex-col max-md:w-full'>
          <div className='flex flex-row items-center gap-3'>
            <Rocket className='size-5' />
            <div className='text-md font-semibold'>
              You're using the {user?.plan.name} plan
            </div>
          </div>
          {user?.plan.identifier !== 'starter' ? (
            ''
          ) : (
            <div className='text-sm text-secondary'>
              You can unlock your limits by upgrading to the next plan.
            </div>
          )}
        </div>
        <PlansDialog>
          <Button
            className={`rounded-[10px] max-md:w-full ${user?.plan.identifier === 'starter' ? '' : 'bg-background text-primary hover:bg-background hover:text-primary/80'}`}
            variant={
              user?.plan.identifier === 'starter' ? 'default' : 'outline'
            }
          >
            {user?.plan.identifier === 'starter'
              ? 'Upgrade plan'
              : user?.plan.identifier === 'pro'
                ? 'Downgrade plan'
                : 'Switch plan'}
          </Button>
        </PlansDialog>
      </div>
      <SettingCard
        title='Manage'
        btn_loading={loadingBilling}
        btn_disabled={loadingBilling}
        action={handleManageBilling}
        description='To manage your payment methods and plans please go on stripe.'
        content={
          <Button
            className='w-full rounded-[12px]'
            variant={'default'}
            type='submit'
            loading={loadingBilling}
            disabled={loadingBilling}
          >
            Manage
          </Button>
        }
      />
      <MetricStats
        differ
        className='grid !grid-cols-1 gap-3 divide-x-0 rounded-[12px] rounded-t-none'
        stats={[
          {
            title: `Metrics limit`,
            description: `For '${projects?.[activeProject].name.charAt(0).toUpperCase() + projects?.[activeProject].name.slice(1).toLowerCase()}'`,
            value: `${projects?.[activeProject].metrics === null ? 0 : projects?.[activeProject].metrics.length}/${user?.plan.metric_per_app_limit}`,
          },
          {
            title: 'Projects limit',
            description: 'On this plan',
            value: `${projects?.length}/${user?.plan.applimit}`,
          },
          {
            title: 'Update limit',
            description: 'Per API key',
            value: user?.plan.requestlimit + ' per minute',
          },
          {
            title: 'Event limit',
            description: 'On this plan',
            value:
              valueFormatter(user.eventcount) +
              '/' +
              valueFormatter(user?.plan.monthlyeventlimit) +
              ' per month',
          },
        ]}
      />
    </div>
  );
}
