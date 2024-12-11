'use client';
import React, { useState } from 'react';
import SettingCard from '../setting-card';
import { Code } from 'react-feather';
import { Button } from '@/components/ui/button';
import PlansDialog from '../plans-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
export default function SettingPaymentPage() {
  const [loadingBilling, setLoadingBilling] = useState(false);
  const router = useRouter();

  const handleManageBilling = () => {
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
        }
      })
      .then((data) => {
        if (data !== null && data !== undefined) {
          toast.success('Opening billing portal...');
          setTimeout(() => router.push(data.url), 500);
        }
      })
      .finally(() => {
        setLoadingBilling(false);
      });
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex w-full flex-row items-center justify-between rounded-[12px] bg-accent px-5 py-3 max-md:flex-col max-md:gap-4'>
        <div className='flex flex-col max-md:w-full'>
          <div className='flex flex-row items-center gap-3'>
            <Code className='size-5' />
            <div className='text-md font-semibold'>You're using free plan</div>
          </div>
          <div className='text-sm text-secondary'>
            You can unlock limits by upgrading to the next plan.
          </div>
        </div>
        <PlansDialog>
          <Button className='rounded-[12px] max-md:w-full' variant={'default'}>
            View plans
          </Button>
        </PlansDialog>
      </div>
      <SettingCard
        title='Manage payment'
        btn_loading={loadingBilling}
        btn_disabled={loadingBilling}
        description='To manage your payment methods and plans please go on stripe.'
        content={
          <Button
            className='w-full rounded-[12px]'
            variant={'default'}
            onClick={handleManageBilling}
          >
            Manage payment
          </Button>
        }
      />
    </div>
  );
}
