import React from 'react';
import SettingCard from '../setting-card';
import { Code } from 'react-feather';
import { Button } from '@/components/ui/button';
import PlansDialog from '../plans-dialog';
export default function SettingPaymentPage() {
  return (
    <>
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
        description='To manage your payment methods and plans please go on stripe.'
        content={
          <Button className='w-full rounded-[12px]' variant={'default'}>
            Manage payment
          </Button>
        }
      />
    </>
  );
}
