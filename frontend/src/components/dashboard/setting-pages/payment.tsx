'use client';
import React, { FormEvent, useContext, useMemo, useState } from 'react';
import SettingCard from '../setting-card';
import { Button } from '@/components/ui/button';
import PlansDialog from '../plans-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ProjectsContext, UserContext } from '@/dash-context';
import MetricStats from '../metric-stats';
import { Rocket } from 'lucide-react';
import { UserRole } from '@/types';

const valueFormatter = (number: number) =>
  Intl.NumberFormat('us').format(number).toString();

export default function SettingPaymentPage() {
  const [loadingBilling, setLoadingBilling] = useState(false);
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { projects, activeProject } = useContext(ProjectsContext);

  const handleManageBilling = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingBilling(true);
    try {
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
      toast.error('Failed to connect to the billing service.');
    } finally {
      setLoadingBilling(false);
    }
  };

  const MetricLimitStat = useMemo(() => {
    let project = projects[activeProject];
    if (project.userrole !== UserRole.Owner) {
      project = projects.filter((proj) => proj.userrole === UserRole.Owner)[0];
    }

    return {
      metricsLength: project.metrics?.length ?? 0,
      projectName: project.name,
    };
  }, [activeProject]);

  return (
    <div className='flex flex-col gap-5'>
      <MetricStats
        differ
        className='grid !grid-cols-1 gap-3 divide-x-0 rounded-[12px]'
        stats={[
          {
            title: `Metrics limit`,
            used: MetricLimitStat.metricsLength,
            total: user?.plan.metric_per_project_limit,
            description: `For '${MetricLimitStat.projectName?.charAt(0).toUpperCase() +
              MetricLimitStat.projectName.slice(1).toLowerCase() || ''
              }'`,
          },
          {
            title: 'Projects limit',
            used:
              projects?.filter((proj) => proj.userrole === UserRole.Owner)
                .length || 0,
            total: user?.plan.projectlimit,
            description: 'On this plan',
          },
          {
            title: 'Update limit',
            description: 'Per API key',
            value: `${user?.plan.requestlimit} per minute`,
          },
          {
            title: 'Event limit',
            description: 'On this plan',
            value: `${valueFormatter(user?.eventcount || 0)}/${valueFormatter(
              user?.plan.monthlyeventlimit || 0,
            )} per month`,
          },
        ]}
      />
      <div
        className={`flex w-full flex-row items-center justify-between rounded-[12px] px-5 py-3 max-md:flex-col max-md:gap-4 ${user?.plan.identifier === 'starter'
            ? 'bg-accent'
            : 'animate-gradient bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white'
          }`}
      >
        <div className='flex flex-col max-md:w-full'>
          <div className='flex flex-row items-center gap-3'>
            <Rocket className='size-5' />
            <div className='text-md font-semibold'>
              You&apos;re using the {user?.plan.name} plan
            </div>
          </div>
          {user?.plan.identifier === 'starter' && (
            <div className='text-sm text-secondary'>
              Unlock more features by upgrading your plan.
            </div>
          )}
        </div>
        <PlansDialog>
          <Button
            className={`rounded-[10px] max-md:w-full ${user?.plan.identifier === 'starter'
                ? ''
                : 'bg-background text-primary hover:bg-background hover:text-primary/80'
              }`}
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
