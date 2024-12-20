'use client';
import React, { useContext, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { BarChart } from '../ui/BarChart';
import { AppsContext } from '@/dash-context';
import { GroupType } from '@/types';
import { EmptyState } from '../ui/empty-state';
import { ChartNetwork } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const TopMetricCard = () => {
  const { applications, activeApp } = useContext(AppsContext);
  const router = useRouter();
  const topMetricData = useMemo(() => {
    const data = [];

    if (applications[activeApp].groups === null) return [];
    if (applications[activeApp].groups.length === 0) return [];
    for (let i = 0; i < applications[activeApp].groups.length; i++) {
      const group = applications[activeApp].groups[i];
      if (group.type === GroupType.Base) {
        data.push({
          name: group.name,
          total: group.metrics[0].total,
        });
      } else {
        data.push({
          name: group.name,
          total: group.metrics[0].total - group.metrics[1].total,
        });
      }
    }

    return data.sort((a, b) => b.total - a.total);
  }, [activeApp]);

  const metricsSum = useMemo(() => {
    let total = 0;
    if (applications[activeApp].groups === null) return 0;
    if (applications[activeApp].groups.length === 0) return 0;
    for (let i = 0; i < applications[activeApp].groups.length; i++) {
      const group = applications[activeApp].groups[i];
      if (group.type === GroupType.Base) {
        total += group.metrics[0].total;
      } else {
        total = total + (group.metrics[0].total - group.metrics[1].total);
      }
    }
    return;
  }, [activeApp]);

  return (
    <Card className='mt-10 rounded-none border-none'>
      <CardHeader className='p-0'>
        <CardTitle>Top metric chart</CardTitle>
        <CardDescription>Top metric across this application.</CardDescription>
      </CardHeader>
      {metricsSum !== 0 || topMetricData.length === 0 ? (
        <EmptyState
          className='py-14 mt-5'
          title='Nothing to display Yet. Check Back Soon!'
          description='Theres no available data for this month.'
          icons={[ChartNetwork]}
          action={{
            label: 'Learn more',
            onClick: () => router.push('/docs/getting-started/introduction'),
          }}
        />
      ) : (
        <CardContent className='mt-5 rounded-[12px] bg-accent p-4'>
          <BarChart
            className='w-full'
            data={topMetricData}
            index='name'
            categories={['total']}
            yAxisWidth={100}
            layout='vertical'
            valueFormatter={(number: number) =>
              `${Intl.NumberFormat('us').format(number).toString()}`
            }
          />
        </CardContent>
      )}
    </Card>
  );
};
