'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppsContext, UserContext } from '@/dash-context';
import { Metric } from '@/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal } from 'react-feather';
import { formatDistanceToNow } from 'date-fns';
import MetricDropdown from '@/components/dashboard/metric-dropdown';
import { Separator } from '@radix-ui/react-separator';
import { fetchDailySummary } from '@/utils';
import { useRouter } from 'next/navigation';
import {
  ArrowUpDown,
  ArrowUpFromDot,
  FileQuestion,
  Loader,
  Search,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';

const formattedDate = (date: Date) => {
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

function sortbyDate(a: Metric, b: Metric, order: string): number {
  if (a.created < b.created) {
    return order === 'new' ? 1 : -1;
  } else if (a.created > b.created) {
    return order === 'new' ? -1 : 1;
  } else {
    return 0;
  }
}
const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};
function sortByTotal(a: Metric, b: Metric): number {
  if (a.total < b.total) {
    return 1;
  } else if (a.total > b.total) {
    return -1;
  } else {
    return 0;
  }
}

export default function MetricTable(props: { search: string; filter: string }) {
  const { applications, activeApp } = useContext(AppsContext);
  const { user } = useContext(UserContext);

  const metricsLimitReached = useMemo(() => {
    if (applications[activeApp].metrics === null) return false;
    else
      return (
        applications[activeApp].metrics.length > user.plan.metric_per_app_limit
      );
  }, [applications[activeApp].metrics]);

  const filteredMetrics = useMemo(() => {
    return (
      applications[activeApp].metrics
        ?.sort((a, b) => {
          if (props.filter === 'new' || props.filter === 'old') {
            return sortbyDate(a, b, props.filter);
          } else if (props.filter === 'total') {
            return sortByTotal(a, b);
          } else {
            return 0;
          }
        })
        .filter((group) =>
          group.name.toLowerCase().includes(props.search.toLowerCase()),
        ) ?? []
    );
  }, [activeApp, props.filter, props.search, applications]);

  return (
    <div className='flex flex-col gap-[15px]'>
      {/* Header component for the table UI */}
      <Header />
      <div className='flex flex-col gap-2 pb-20'>
        {/* Items components */}
        {filteredMetrics.length === 0 ? (
          <EmptyState
            title='No Results Found'
            description='Try adjusting your search filters.'
            icons={[Search, FileQuestion]}
          />
        ) : (
          <>
            {filteredMetrics.map((metric, i) => {
              const isBlocked =
                metricsLimitReached &&
                (applications[activeApp].metrics?.findIndex(
                  (m) => m.id === metric.id,
                ) ?? 0) >
                user.plan.metric_per_app_limit - 1;
              return (
                <Item
                  key={metric.id}
                  metric={metric}
                  index={i}
                  blocked={isBlocked}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
function Header() {
  return (
    <div className='grid w-full grid-cols-[2fr,1.5fr,1.5fr,150px,50px] gap-[10px] rounded-[12px] bg-accent px-5 py-3 text-xs uppercase text-secondary max-lg:hidden'>
      <div>metric</div>
      <div>total value</div>
      <div>daily update</div>
      <div className='text-end'>Created</div>
    </div>
  );
}
const Item = (props: { metric: Metric; index: number; blocked: boolean }) => {
  const [dailyUpdate, setDailyUpdate] = useState<number | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const todayBadgeColor = (v: number | null) => {
    if (v === null || v === 0) {
      return '';
    } else {
      if (v > 0) {
        return 'bg-green-100 text-green-600';
      } else {
        return 'bg-red-100 text-red-600';
      }
    }
  };

  const todayBadgeSign = (v: number | null) => {
    if (v === null || v === 0 || v < 0) {
      return '';
    } else {
      if (v > 0) {
        return '+';
      }
    }
  };

  const load = async () => {
    const { pos, neg } = await fetchDailySummary(
      props.metric.appid,
      props.metric.id,
    );
    setDailyUpdate(pos - neg);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className='relative'>
      <div
        className={`absolute z-10 h-full w-full cursor-pointer rounded-[12px] opacity-60 transition-all duration-200 hover:bg-accent max-lg:rounded-l-none ${props.blocked ? 'cursor-not-allowed opacity-50' : ''}`}
        onClick={() => {
          if (props.blocked) {
            toast.error(
              'You have exceeded your plan limits. Please upgrade to unlock your metrics.',
            );
          } else {
            setIsLoading(true);
            router.push(
              `/dashboard/metrics/${encodeURIComponent(props.metric.name)}`,
            );
          }
        }}
      />
      <div
        className={`relative grid h-[50px] w-full select-none grid-cols-[2fr,1.5fr,1.5fr,150px,50px] gap-[10px] rounded-[12px] px-5 max-lg:grid max-lg:h-fit max-lg:grid-cols-3 max-lg:rounded-l-none max-lg:border-l max-lg:border-blue-500 max-lg:py-4 max-sm:p-3`}
      >
        <div className='flex flex-row items-center gap-[10px] text-[15px] max-lg:col-span-2'>
          <div className='rounded-full bg-accent p-2'>
            {isLoading ? (
              <Loader className='size-4 animate-spin text-black' />
            ) : props.metric.type === 0 ? (
              <ArrowUpFromDot className='size-4 text-black' />
            ) : (
              <ArrowUpDown className='size-4 text-black' />
            )}
          </div>
          {props.metric.name}
        </div>

        <div className='col-span-1 flex h-full w-full items-center justify-end lg:hidden'>
          <MetricDropdown metric={props.metric}>
            <Button
              className='z-20 rounded-[12px] !bg-transparent'
              variant={'secondary'}
              size={'icon'}
            >
              <MoreHorizontal />
            </Button>
          </MetricDropdown>
        </div>
        <Separator
          orientation='horizontal'
          className='col-span-3 my-2 lg:hidden'
        />
        <div className='my-auto line-clamp-1 h-fit w-full place-items-center items-center font-mono text-[15px] max-lg:flex max-lg:flex-col max-lg:place-items-start max-lg:gap-2 max-sm:col-span-3'>
          <div className='font-sans font-semibold text-blue-500 lg:hidden'>
            Total value
          </div>
          {valueFormatter(props.metric.total)}
        </div>
        <div className='flex items-center max-lg:flex-col max-lg:place-items-start max-lg:gap-2'>
          <div className='text-sm font-semibold text-primary lg:hidden'>
            Daily value
          </div>
          <Badge
            className={`pointer-events-none h-fit w-fit rounded-[6px] bg-zinc-500/10 font-medium text-zinc-500 shadow-none ${todayBadgeColor(
              dailyUpdate,
            )}}`}
          >
            {todayBadgeSign(dailyUpdate)}
            {valueFormatter(dailyUpdate === null ? 0 : dailyUpdate)}
          </Badge>
        </div>
        <div className='flex items-center justify-end text-sm font-light text-secondary max-lg:flex-col max-lg:place-items-start max-lg:gap-2 max-sm:col-span-3'>
          <div className='text-sm font-semibold text-primary lg:hidden'>
            Created
          </div>
          {formattedDate(props.metric.created)}
        </div>
        <div className='flex h-full w-full items-center justify-end max-lg:hidden'>
          <MetricDropdown metric={props.metric}>
            <Button
              className='z-20 rounded-[12px] !bg-transparent'
              variant={'secondary'}
              size={'icon'}
            >
              <MoreHorizontal />
            </Button>
          </MetricDropdown>
        </div>
      </div>
    </div>
  );
};
