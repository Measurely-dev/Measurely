'use client';
import React, { FormEvent, useContext, useState } from 'react';
import SettingCard from '../setting-card';
import { Code } from 'react-feather';
import { Button } from '@/components/ui/button';
import PlansDialog from '../plans-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/dash-context';
import MetricStats from '../metric-stats';
export default function SettingPaymentPage() {
  const [loadingBilling, setLoadingBilling] = useState(false);
  const router = useRouter();
  const { user } = useContext(UserContext);
  function plan() {
    let currentPlan = { metric: 0, app: 0, request: 0 };
    switch (user?.plan) {
      case 'starter':
        currentPlan.metric = 2;
        currentPlan.app = 1;
        currentPlan.request = 100;
        break;
      case 'plus':
        currentPlan.metric = 5;
        currentPlan.app = 2;
        currentPlan.request = 500;
        break;
      case 'pro':
        currentPlan.metric = 10;
        currentPlan.app = 5;
        currentPlan.request = 1000;
        break;
    }
    return currentPlan;
  }

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
    <div className='flex flex-col gap-5'>
      <div className='flex w-full flex-row items-center justify-between rounded-[12px] bg-accent px-5 py-3 max-md:flex-col max-md:gap-4'>
        <div className='flex flex-col max-md:w-full'>
          <div className='flex flex-row items-center gap-3'>
            <Code className='size-5' />
            <div className='text-md font-semibold'>
              You're using the {user?.plan} plan
            </div>
          </div>
          <div className='text-sm text-secondary'>
            You can unlock limits by upgrading to the next plan.
          </div>
        </div>
        <PlansDialog>
          <Button className='rounded-[12px] max-md:w-full' variant={'default'}>
            {user?.plan === 'starter' ? 'Upgrade plan' : 'Switch plan'}
          </Button>
        </PlansDialog>
      </div>
      <MetricStats
        differ
        className='grid !grid-cols-1 gap-3 divide-x-0 rounded-[12px]'
        stats={[
          {
            title: 'Metric available',
            description: 'On this plan',
            value: plan().metric,
          },
          {
            title: 'Number of application available',
            description: 'On this plan',
            value: plan().app,
          },
          {
            title: 'Request limit',
            description: 'On this plan',
            value: plan().request + " per minute",
          },
        ]}
      />
      <SettingCard
        title='Manage payment & plans'
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
    </div>
  );
}
