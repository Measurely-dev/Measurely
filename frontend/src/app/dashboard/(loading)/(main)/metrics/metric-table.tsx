'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppsContext } from '@/dash-context';
import { Group, GroupType } from '@/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AlertCircle, MoreHorizontal } from 'react-feather';
import { formatDistanceToNow } from 'date-fns';
import MetricDropdown from '@/components/dashboard/metric-dropdown';
import Empty from '@/components/dashboard/empty';
import { Separator } from '@radix-ui/react-separator';
import { fetchDailySummary } from '@/utils';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, ArrowUpFromDot } from 'lucide-react';

const formattedDate = (date: Date) => {
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

function sortbyDate(a: Group, b: Group, order: string): number {
  if (a.created < b.created) {
    return order === 'new' ? 1 : -1;
  } else if (a.created > b.created) {
    return order === 'new' ? -1 : 1;
  } else {
    return 0;
  }
}

function sortByTotal(a: Group, b: Group): number {
  let aTotal = 0;
  let bTotal = 0;

  if (a.type === GroupType.Base) {
    aTotal = a.metrics[0].total;
  } else if (a.type === GroupType.Dual) {
    aTotal = a.metrics[0].total - a.metrics[1].total;
  }

  if (b.type === GroupType.Base) {
    bTotal = b.metrics[0].total;
  } else if (b.type === GroupType.Dual) {
    bTotal = b.metrics[0].total - b.metrics[1].total;
  }

  if (aTotal < bTotal) {
    return 1;
  } else if (aTotal > bTotal) {
    return -1;
  } else {
    return 0;
  }
}

export default function MetricTable(props: { search: string; filter: string }) {
  const { applications, activeApp } = useContext(AppsContext);

  const filteredGroups = useMemo(() => {
    return (
      applications[activeApp].groups
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
      <div className='flex flex-col gap-2'>
        {/* Items components */}
        {filteredGroups.length === 0 ? (
          <Empty>
            <AlertCircle className='size-10' />
            <div className='flex flex-col items-center gap-3 text-center'>
              No metric found with that name
            </div>
          </Empty>
        ) : (
          <>
            {filteredGroups.map((group, i) => {
              return <Item key={group.metrics[0].id} group={group} index={i} />;
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
const Item = (props: { group: Group; index: number }) => {
  const [dailyUpdate, setDailyUpdate] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const router = useRouter();

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
    if (props.group.metrics.length === 0) {
      return;
    }

    let daily = 0;
    if (props.group.type === GroupType.Base) {
      setTotal(props.group.metrics[0].total);
      daily = await fetchDailySummary(
        props.group.appid,
        props.group.id,
        props.group.metrics[0].id,
      );
    } else if (props.group.type === GroupType.Dual) {
      setTotal(props.group.metrics[0].total - props.group.metrics[1].total);
      const pos = await fetchDailySummary(
        props.group.appid,
        props.group.id,
        props.group.metrics[0].id,
      );
      const neg = await fetchDailySummary(
        props.group.appid,
        props.group.id,
        props.group.metrics[1].id,
      );
      daily = pos - neg;
    }

    setDailyUpdate(daily);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className='relative'>
      <div
        className='absolute z-10 h-full w-full cursor-pointer rounded-[12px] opacity-60 transition-all duration-200 hover:bg-accent max-lg:rounded-l-none'
        onClick={() => {
          router.push(
            `/dashboard/metrics/${encodeURIComponent(props.group.name)}`,
          );
        }}
      />
      <div
        className={`relative grid h-[50px] w-full select-none grid-cols-[2fr,1.5fr,1.5fr,150px,50px] gap-[10px] rounded-[12px] px-5 max-lg:grid max-lg:h-fit max-lg:grid-cols-3 max-lg:rounded-l-none max-lg:border-l max-lg:border-blue-500 max-lg:py-4 max-sm:p-3`}
      >
        <div className='flex flex-row items-center gap-[10px] text-[15px] max-lg:col-span-2'>
          <div className='rounded-full border border-input/50 bg-accent p-2'>
            {props.group.type === 0 ? (
              <ArrowUpFromDot className='size-4 text-black' />
            ) : (
              <ArrowUpDown className='size-4 text-black' />
            )}
          </div>
          {props.group.name}
        </div>

        <div className='col-span-1 flex h-full w-full items-center justify-end lg:hidden'>
          <MetricDropdown group={props.group}>
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
          {total === null ? '0' : total}
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
            {dailyUpdate === null ? '0' : dailyUpdate}
          </Badge>
        </div>
        <div className='flex items-center justify-end text-sm font-light text-secondary max-lg:flex-col max-lg:place-items-start max-lg:gap-2 max-sm:col-span-3'>
          <div className='text-sm font-semibold text-primary lg:hidden'>
            Created
          </div>
          {formattedDate(props.group.created)}
        </div>
        <div className='flex h-full w-full items-center justify-end max-lg:hidden'>
          <MetricDropdown group={props.group}>
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
