'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardFooter } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
  { month: 'July', desktop: 186, mobile: 80 },
  { month: 'August', desktop: 305, mobile: 200 },
  { month: 'September', desktop: 237, mobile: 120 },
  { month: 'October', desktop: 73, mobile: 190 },
  { month: 'November', desktop: 209, mobile: 130 },
  { month: 'December', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'black',
  },
  mobile: {
    label: 'Mobile',
    color: 'blue',
  },
} satisfies ChartConfig;

export function OverviewChart() {
  return (
    <Card className='flex w-[100%] flex-col gap-[10px] rounded-2xl border-none bg-accent p-5'>
      <div className='mb-[10px] flex flex-col gap-[5px]'>
        <div className='text-base font-medium'>Bar chart</div>
        <div className='text-xs text-secondary'>January - June 2024</div>
      </div>

      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey='month'
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey='desktop'
            stackId='a'
            fill='var(--color-desktop)'
            radius={[0, 0, 8, 8]}
          />
          <Bar
            dataKey='mobile'
            stackId='a'
            fill='var(--color-mobile)'
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
      <CardFooter className='flex-col items-start gap-2 px-0 py-0 text-sm'>
        <div className='flex gap-2 font-medium leading-none'>
          Trending up by 5.2% this month <TrendingUp className='h-4 w-4' />
        </div>
        <div className='leading-none text-muted-foreground'>
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
