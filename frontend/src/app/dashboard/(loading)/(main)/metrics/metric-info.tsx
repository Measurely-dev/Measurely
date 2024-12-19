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
import { Group, GroupType } from '@/types';
import { AppsContext } from '@/dash-context';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AdvancedOptionsMetricDialog from '@/components/dashboard/advanced-options-metric-dialog';
import { calculateTrend, loadChartData } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart } from '@/components/ui/BarChart';
import { AreaChart } from '@/components/ui/areaChart';

export default function MetricInformations(props: {
  children: ReactNode;
  group: Group;
}) {
  const [date, setDate] = useState<Date>();
  const [range, setRange] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTrendActive, setIsTrendActive] = useState(false);
  const { applications, activeApp } = useContext(AppsContext);
  const [canLoad, setCanLoad] = useState(false);
  const [chartType, setChartType] = useState<'stacked' | 'percent'>('stacked');

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
                onValueChange={(e) => {
                  const value = parseInt(e);

                  if (value !== range) {
                    setRange(value);
                  }
                }}
                value={range.toString()}
              >
                <ToggleGroupItem
                  value={'0'}
                  className='h-[33px] rounded-l-[12px] rounded-r-none data-[state=on]:pointer-events-none'
                >
                  D
                </ToggleGroupItem>
                <ToggleGroupItem value='7' className='h-[33px] rounded-none data-[state=on]:pointer-events-none'>
                  75D
                </ToggleGroupItem>
                <ToggleGroupItem value='15' className='h-[33px] rounded-none data-[state=on]:pointer-events-none'>
                  15D
                </ToggleGroupItem>
                <ToggleGroupItem
                  value='30'
                  className='h-[33px] rounded-l-none rounded-r-[12px] data-[state=on]:pointer-events-none'
                >
                  30D
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <AdvancedOptionsMetricDialog
              chartType={chartType}
              setChartType={setChartType}
              groupType={props.group.type}
              isTrendActive={isTrendActive}
              setIsTrendActive={setIsTrendActive}
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
          <Skeleton className='h-[50vh] w-full rounded-[12px]' />
        ) : (
          <>
            {isTrendActive ? (
              <AreaChart
                className='w-full h-[50vh]'
                data={calculateTrend(
                  data,
                  props.group.metrics[0].total,
                  props.group.type,
                  props.group.type === GroupType.Base
                    ? props.group.name
                    : props.group.metrics[0].name,
                  props.group.type === GroupType.Base
                    ? ''
                    : props.group.metrics[1].name,
                  props.group.name,
                )}
                index='date'
                color='blue'
                categories={[props.group.name]}
                valueFormatter={(number: number) =>
                  `${Intl.NumberFormat('us').format(number).toString()}`
                }
                xAxisLabel='Date'
                yAxisLabel='Total'
              />
            ) : (
              <>
                {props.group.type === 0 ? (
                  <BarChart
                    className='w-full h-[50vh]'
                    data={data}
                    index='date'
                    color='blue'
                    categories={[props.group.name]}
                    valueFormatter={(number: number) =>
                      `${Intl.NumberFormat('us').format(number).toString()}`
                    }
                    onValueChange={(v) => console.log(v)}
                    xAxisLabel='Date'
                    yAxisLabel='Total'
                  />
                ) : (
                  <BarChart
                    className='w-full h-[50vh]'
                    data={data}
                    index='date'
                    type={chartType}
                    colors={['green', 'red']}
                    categories={[
                      props.group.metrics[0].name,
                      props.group.metrics[1].name,
                    ]}
                    valueFormatter={(number: number) =>
                      `${Intl.NumberFormat('us').format(number).toString()}`
                    }
                    xAxisLabel='Date'
                    yAxisLabel='Total'
                  />
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
