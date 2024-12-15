'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { Sliders, X } from 'lucide-react';
import { Group } from '@/types';
import { AppsContext } from '@/dash-context';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AdvancedOptionsMetricDialog from '@/components/dashboard/advanced-options-metric-dialog';
import { loadChartData } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart } from '@/components/ui/BarChart';
import { DatePicker } from '@/components/ui/date-picker';

export default function MetricInformations(props: {
  children: ReactNode;
  group: Group;
}) {
  const [date, setDate] = useState<Date>();
  const [range, setRange] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { applications, activeApp } = useContext(AppsContext);
  const [canLoad, setCanLoad] = useState(false);
  const [chartType, setChartType] = useState<'stacked' | 'percent'>('stacked');
  const dualData = [
    { date: 'Jan 23', AccountsCreated: 500, AccountsDeleted: 120 },
    { date: 'Feb 23', AccountsCreated: 480, AccountsDeleted: 100 },
    { date: 'Mar 23', AccountsCreated: 520, AccountsDeleted: 130 },
    { date: 'Apr 23', AccountsCreated: 550, AccountsDeleted: 140 },
    { date: 'May 23', AccountsCreated: 530, AccountsDeleted: 150 },
    { date: 'Jun 23', AccountsCreated: 510, AccountsDeleted: 125 },
    { date: 'Jul 23', AccountsCreated: 560, AccountsDeleted: 110 },
    { date: 'Aug 23', AccountsCreated: 540, AccountsDeleted: 105 },
    { date: 'Sep 23', AccountsCreated: 490, AccountsDeleted: 115 },
    { date: 'Oct 23', AccountsCreated: 505, AccountsDeleted: 120 },
    { date: 'Nov 23', AccountsCreated: 520, AccountsDeleted: 130 },
    { date: 'Dec 23', AccountsCreated: 580, AccountsDeleted: 140 },
  ];
  const basicData = [
    { date: 'Jan 23', TotalUsers: 5000 },
    { date: 'Feb 23', TotalUsers: 5200 },
    { date: 'Mar 23', TotalUsers: 5400 },
    { date: 'Apr 23', TotalUsers: 5600 },
    { date: 'May 23', TotalUsers: 5800 },
    { date: 'Jun 23', TotalUsers: 6000 },
    { date: 'Jul 23', TotalUsers: 6200 },
    { date: 'Aug 23', TotalUsers: 6400 },
    { date: 'Sep 23', TotalUsers: 6600 },
    { date: 'Oct 23', TotalUsers: 6800 },
    { date: 'Nov 23', TotalUsers: 7000 },
    { date: 'Dec 23', TotalUsers: 7200 },
  ];

  useEffect(() => {
    if (canLoad) {
      if (!date) {
        setDate(new Date());
        return;
      }
      const load = async () => {
        setLoading(true);
        if (
          applications !== undefined &&
          applications?.[activeApp] !== undefined
        ) {
          const data = await loadChartData(
            date,
            range,
            props.group,
            applications?.[activeApp],
          );

          if (!data) {
            setData([]);
          } else {
            setData(data);
          }
        }
        setLoading(false);
      };

      load();
    }
  }, [date, range, canLoad]);

  return (
    <Dialog
      onOpenChange={(state) => {
        if (state === true) {
          setCanLoad(true);
        } else {
          setCanLoad(false);
        }
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='min-w-[70%] rounded-[16px] p-4 shadow-none ring ring-input max-lg:max-w-[90%] max-md:max-w-[95%] max-sm:max-w-[100%] max-sm:rounded-[0px] max-sm:p-2 max-sm:pt-4 max-sm:ring-0'>
        <div className='flex flex-row items-center justify-between max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-2'>
          <DialogTitle className='flex flex-col items-start gap-1 text-start !text-lg font-medium'>
            {props.group.name}
          </DialogTitle>
          <div className='sm:hidden'>
            <div className='flex flex-row items-center font-mono text-xl'>
              {props.group.type === 0 ? (
                <>{props.group.metrics[0].total}</>
              ) : (
                <>
                  {props.group.metrics[0].total - props.group.metrics[1].total}
                  <div className='ml-2 h-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                    +{props.group.metrics[0].total}
                  </div>
                  <div className='ml-2 h-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                    -{props.group.metrics[1].total}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className='flex flex-row items-center gap-2 max-sm:w-full max-sm:flex-col max-sm:items-start'>
            <div className='flex items-center gap-2'>
              <ToggleGroup
                type='single'
                defaultValue='0'
                size={'sm'}
                className='h-[35px] w-fit gap-0 divide-x rounded-[12px] border'
                onValueChange={(e) => setRange(parseInt(e))}
                value={range.toString()}
              >
                <ToggleGroupItem
                  value={'0'}
                  className='h-[33px] rounded-l-[12px] rounded-r-none data-[state=on]:select-none'
                >
                  D
                </ToggleGroupItem>
                <ToggleGroupItem value='7' className='h-[33px] rounded-none'>
                  7D
                </ToggleGroupItem>
                <ToggleGroupItem value='15' className='h-[33px] rounded-none'>
                  15D
                </ToggleGroupItem>
                <ToggleGroupItem
                  value='30'
                  className='h-[33px] rounded-l-none rounded-r-[12px]'
                >
                  30D
                </ToggleGroupItem>
              </ToggleGroup>
              <DatePicker setDate={setDate} date={date} />
            </div>
            <AdvancedOptionsMetricDialog
              chartType={chartType}
              setChartType={setChartType}
              groupType={props.group.type}
            >
              <Button
                variant={'secondary'}
                className='items-center gap-2 rounded-[12px] max-sm:w-full'
              >
                <Sliders className='size-4' />
                Advanced
              </Button>
            </AdvancedOptionsMetricDialog>
            <DialogClose className='max-sm:absolute max-sm:right-2 max-sm:top-2'>
              <Button
                type='button'
                size={'icon'}
                variant='secondary'
                className='rounded-[12px]'
              >
                <X />
              </Button>
            </DialogClose>
          </div>
        </div>
        <div className='max-sm:hidden'>
          <div className='flex flex-row items-center font-mono text-2xl'>
            {props.group.type === 0 ? (
              Intl.NumberFormat('us')
                .format(props.group.metrics[0].total)
                .toString()
            ) : (
              <>
                {props.group.metrics[0].total - props.group.metrics[1].total}
                <div className='ml-2 h-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                  +
                  {Intl.NumberFormat('us')
                    .format(props.group.metrics[0].total)
                    .toString()}
                </div>
                <div className='ml-2 h-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                  -
                  {Intl.NumberFormat('us')
                    .format(props.group.metrics[1].total)
                    .toString()}
                </div>
              </>
            )}
          </div>
        </div>
        {loading ? (
          <Skeleton className='h-[200px] w-full rounded-[12px]' />
        ) : (
          <>
            {props.group.type === 0 ? (
              <BarChart
                className='w-full'
                data={basicData}
                index='date'
                color='blue'
                categories={['TotalUsers']}
                valueFormatter={(number: number) =>
                  `${Intl.NumberFormat('us').format(number).toString()}`
                }
                onValueChange={(v) => console.log(v)}
                xAxisLabel='Month'
                yAxisLabel='Total'
              />
            ) : (
              <BarChart
                className='w-full'
                data={dualData}
                index='date'
                type={chartType}
                colors={['green', 'red']}
                categories={['AccountsCreated', 'AccountsDeleted']}
                valueFormatter={(number: number) =>
                  `${Intl.NumberFormat('us').format(number).toString()}`
                }
                onValueChange={(v) => console.log(v)}
                xAxisLabel='Month'
                yAxisLabel='Accounts'
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
