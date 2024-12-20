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
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const TopMetricCard = () => {
  const { applications, activeApp } = useContext(AppsContext);

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
    <Card className='mt-5 rounded-none border-none'>
      <CardHeader className='p-0'>
        <CardTitle>Top metric chart</CardTitle>
        <CardDescription>Top metric across this application.</CardDescription>
      </CardHeader>
      <CardContent className='mt-5 rounded-[12px] bg-accent p-4'>
        {metricsSum !== 0 || topMetricData.length === 0 ? (
          <div className='flex w-full flex-col items-center justify-center gap-2 rounded-[12px] bg-accent px-5 py-20'>
            <div className='text-3xl font-semibold'>Nothing to Display</div>
            <div className='text-md text-center text-secondary max-sm:text-sm'>
              There's no relevant top metric to show here
            </div>
            <div className='flex flex-row items-center gap-4'>
              <Link href={'/docs/getting-started/introduction'}>
                <Button className='mt-2 rounded-[12px]'>Learn more</Button>
              </Link>
            </div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};
