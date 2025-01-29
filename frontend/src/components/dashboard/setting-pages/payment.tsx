'use client';

// Import necessary dependencies
import React, { FormEvent, useContext, useState } from 'react';
import SettingCard from '../setting-card';
import { Button } from '@/components/ui/button';
import PlansDialog from '../plans-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ProjectsContext } from '@/dash-context';
import MetricStats from '../metric-stats';
import { Rocket } from 'lucide-react';

// Component for managing payment settings and billing
export default function PaymentSettings() {
  // State for tracking billing form submission
  const [loadingBilling, setLoadingBilling] = useState(false);
  const router = useRouter();
  const { projects, activeProject } = useContext(ProjectsContext);

  // Handler for managing billing portal redirect
  const handleManageBilling = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingBilling(true);
    try {
      // Fetch billing portal URL from API
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (resp.ok) {
        const data = await resp.json();
        toast.success('Opening billing portal...');
        setTimeout(() => router.push(data.url), 500);
      } else {
        const errorText = await resp.text();
        toast.error(errorText);
      }
    } catch (err) {
      toast.error('Failed to connect to the billing service.' + err);
    } finally {
      setLoadingBilling(false);
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      {/* Display metrics and usage statistics */}
      <MetricStats
        differ
        className='grid !grid-cols-1 gap-3 divide-x-0 rounded-[12px]'
        stats={[
          {
            title: `Metrics limit`,
            used: projects[activeProject].metrics === null ? 0 : projects[activeProject].metrics.length,
            total: projects[activeProject].plan.metric_limit,
            description: `For '${projects[activeProject].name}'`,
          },
          {
            title: 'Event limit per month',
            used: projects[activeProject].monthly_event_count,
            total: projects[activeProject].max_event_per_month,
            description: `For '${projects[activeProject].name}'`,
          },
        ]}
      />

      {/* Current plan display and upgrade/downgrade button */}
      <div
        className={`flex w-full flex-row items-center justify-between rounded-[12px] px-5 py-3 max-md:flex-col max-md:gap-4 ${
          projects[activeProject].plan.name.toLowerCase() === 'starter'
            ? 'bg-accent'
            : 'animate-gradient bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white'
        }`}
      >
        <div className='flex flex-col max-md:w-full'>
          <div className='flex flex-row items-center gap-3'>
            <Rocket className='size-5' />
            <div className='text-md font-semibold'>
              You&apos;re using the {projects[activeProject].plan.name.toLowerCase()} plan
            </div>
          </div>
          {projects[activeProject].plan.name.toLowerCase() === 'starter' && (
            <div className='text-sm text-muted-foreground'>
              Unlock more features by upgrading your plan.
            </div>
          )}
        </div>
        <PlansDialog>
          <Button
            className={`rounded-[10px] max-md:w-full ${
              projects[activeProject].plan.name.toLowerCase() === 'starter'
                ? ''
                : 'bg-background text-primary hover:bg-background hover:text-primary/80'
            }`}
            variant={projects[activeProject].plan.name.toLowerCase() === 'starter' ? 'default' : 'outline'}
          >
            {projects[activeProject].plan.name.toLowerCase() === 'starter'
              ? 'Upgrade plan'
              : projects[activeProject].plan.name.toLowerCase() === 'pro'
                ? 'Downgrade plan'
                : 'Switch plan'}
          </Button>
        </PlansDialog>
      </div>

      {/* Billing management card */}
      <SettingCard
        title='Manage'
        btn_loading={loadingBilling}
        btn_disabled={loadingBilling}
        action={handleManageBilling}
        description='Manage payment methods and plans through Stripe.'
        content={
          <Button
            className='w-full rounded-[10px]'
            variant='default'
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
