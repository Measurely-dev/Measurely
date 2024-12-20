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

const defaultData = [
  {
    name: 'Login Attempts',
    total: 2488,
  },
  {
    name: 'Page Views',
    total: 1445,
  },
  {
    name: 'API Requests',
    total: 743,
  },
  {
    name: 'File Uploads',
    total: 281,
  },
  {
    name: 'Sign-Ups',
    total: 251,
  },
  {
    name: 'Password Resets',
    total: 232,
  },
  {
    name: 'Subscription Upgrades',
    total: 98,
  },
];

export const TopMetricCard = () => {
  const { applications, activeApp } = useContext(AppsContext);

  const topMetricData = useMemo(() => {
    let data = [];

    if (applications[activeApp].groups === null) return defaultData;
    if (applications[activeApp].groups.length === 0) return defaultData;
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

  return (
    <Card className='mt-5 rounded-none border-none'>
      <CardHeader className='p-0'>
        <CardTitle>Top metric chart</CardTitle>
        <CardDescription>Top metric across this application.</CardDescription>
      </CardHeader>
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
    </Card>
  );
};
