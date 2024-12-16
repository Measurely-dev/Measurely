'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { BarChart } from '../ui/BarChart';

const topMetric = [
  {
    action: 'Login Attempts',
    occurrences: 2488,
  },
  {
    action: 'Page Views',
    occurrences: 1445,
  },
  {
    action: 'API Requests',
    occurrences: 743,
  },
  {
    action: 'File Uploads',
    occurrences: 281,
  },
  {
    action: 'Sign-Ups',
    occurrences: 251,
  },
  {
    action: 'Password Resets',
    occurrences: 232,
  },
  {
    action: 'Subscription Upgrades',
    occurrences: 98,
  },
];

export const TopMetricCard = () => {
  return (
    <Card className='rounded-none border-none'>
      <CardHeader className='p-0 px-5'>
        <CardTitle>Top metric chart</CardTitle>
        <CardDescription>Top metric across this application.</CardDescription>
      </CardHeader>
      <CardContent className='mt-5 mx-5 rounded-[12px] mb-5 bg-accent p-4'>
        <BarChart
          className='w-full'
          data={topMetric}
          index='action'
          categories={['occurrences']}
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
