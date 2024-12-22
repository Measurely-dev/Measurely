'use client';
import React, { useContext, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { BarChart } from '../ui/bar-chart';
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
    let addedMetrics = 0;
    for (let i = 0; i < applications[activeApp].groups.length; i++) {
      const group = applications[activeApp].groups[i];
      let total = group.metrics[0].total;
      if (group.type === GroupType.Dual) {
        total - group.metrics[1].total
      }

      if (total !== 0) {
        data.push({
          name: group.name,
          total: total,
        });
        addedMetrics += 1
      }

      if (addedMetrics >= 7) break;
    }

    return data.sort((a, b) => b.total - a.total);
  }, [activeApp]);

  return (
    <Card className='mt-10 rounded-none border-none'>
      <CardHeader className='p-0'>
        <CardTitle>Top metric chart</CardTitle>
        <CardDescription>Top metric across this application.</CardDescription>
      </CardHeader>
      {topMetricData.length === 0 ? (
        <EmptyState
          className='mt-5 py-14'
          title='No items to show at the moment.'
          description="No metrics to display yet. Data will populate as soon as it's available."
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
