import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Group } from '@/types';
import { DatePicker } from '@/components/ui/date-picker';

const multiData = [
  { month: 'January', positive: 186, negative: 80 },
  { month: 'February', positive: 305, negative: 200 },
  { month: 'March', positive: 237, negative: 120 },
  { month: 'April', positive: 73, negative: 190 },
  { month: 'May', positive: 209, negative: 130 },
  { month: 'June', positive: 214, negative: 140 },
];

const basicData = [
  { month: 'January', total: 186 },
  { month: 'February', total: 305 },
  { month: 'March', total: 237 },
  { month: 'April', total: 73 },
  { month: 'May', total: 209 },
  { month: 'June', total: 214 },
];

export default function MetricInformations(props: {
  children: ReactNode;
  group: Group;
  total: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='max-md: max-h-[95%] !min-w-[60%] !rounded-[16px] !shadow-none !ring ring-input max-md:max-w-[95%]'>
        <DialogHeader className='static'>
          <DialogTitle className='flex flex-row items-center gap-5 !text-xl'>
            {props.group.name}
            <div>
              <div className='flex w-fit items-center justify-center rounded-[12px] bg-accent p-1 px-2 font-mono text-[16px]'>
                {props.total}
              </div>
            </div>
          </DialogTitle>
          <DialogClose className='absolute right-5 top-3'>
            <Button
              type='button'
              size={'icon'}
              variant='secondary'
              className='rounded-[12px]'
            >
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <DatePicker />
        {props.group.type === 0 ? (
          <>
            <ChartContainer
              config={{
                total: {
                  label: props.group.name,
                  color: 'skyblue',
                },
              }}
              className='rounded-[12px] bg-accent p-3'
            >
              <AreaChart
                accessibilityLayer
                data={basicData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  labelClassName='!min-w-[200px]'
                />
                <Area
                  dataKey='total'
                  type='natural'
                  fill='skyblue'
                  fillOpacity={0.5}
                  stroke='skyblue'
                  radius={8}
                />
              </AreaChart>
            </ChartContainer>
          </>
        ) : (
          <div className='rounded-[12px] bg-accent p-3'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2 xl:flex-row xl:justify-between'>
                <Label className='flex flex-col gap-2 capitalize'>
                  Positive variable total ({props.group.metrics[0].name})
                  <div className='font-mono text-lg text-green-500'>
                    -{props.total}
                  </div>
                </Label>
                <Label className='flex flex-col gap-2 capitalize xl:text-end'>
                  Negative variable total ({props.group.metrics[1].name})
                  <div className='font-mono text-lg text-red-500'>
                    +{props.total}
                  </div>
                </Label>
              </div>
            </div>
            <ChartContainer
              config={{
                positive: {
                  label: props.group.metrics[0].name,
                  color: 'green',
                },
                negative: {
                  label: props.group.metrics[1].name,
                  color: 'red',
                },
              }}
            >
              <AreaChart
                accessibilityLayer
                data={multiData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator='dot' />}
                  labelClassName='!min-w-[200px]'
                />
                <Area
                  dataKey='positive'
                  type='natural'
                  strokeOpacity={0.6}
                  fill='lime'
                  fillOpacity={0.2}
                  stroke='lime'
                  stackId='a'
                />
                <Area
                  dataKey='negative'
                  type='natural'
                  strokeOpacity={0.6}
                  fill='red'
                  fillOpacity={0.2}
                  stroke='red'
                  stackId='a'
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
