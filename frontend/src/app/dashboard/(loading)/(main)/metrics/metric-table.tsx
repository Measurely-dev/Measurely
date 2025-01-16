'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectsContext, UserContext } from '@/dash-context';
import { Metric, MetricType, UserRole } from '@/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal } from 'react-feather';
import { formatDistanceToNow } from 'date-fns';
import MetricDropdown from '@/components/dashboard/metric-dropdown';
import { fetchEventVariation, INTERVAL } from '@/utils';
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import EditMetricDialogContent from '@/components/dashboard/edit-metric-dialog-content';

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
  const aTotal = a.totalpos - a.totalneg;
  const bTotal = b.totalpos - b.totalneg;
  if (aTotal < bTotal) {
    return 1;
  } else if (aTotal > bTotal) {
    return -1;
  } else {
    return sortbyDate(a, b, 'new');
  }
}

export default function MetricTable(props: { search: string; filter: string }) {
  const { projects, activeProject } = useContext(ProjectsContext);
  const { user } = useContext(UserContext);
  const metricsLimitReached = useMemo(() => {
    if (projects[activeProject].metrics === null) return false;
    else
      return (
        projects[activeProject].metrics.length >
        user.plan.metric_per_project_limit
      );
  }, [projects[activeProject].metrics]);

  const filteredMetrics = useMemo(() => {
    return (
      projects[activeProject].metrics
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
  }, [activeProject, props.filter, props.search, projects]);

  return (
    <div className='flex flex-col gap-[15px]'>
      <div className='flex flex-col gap-2 pb-20'>
        {filteredMetrics.length === 0 ? (
          <EmptyState
            title='No Results Found'
            description='Try adjusting your search filters.'
            icons={[Search, FileQuestion]}
          />
        ) : (
          <>
            <Table className='overflow-hidden rounded-[16px]'>
              <TableCaption>A list of your metrics.</TableCaption>
              <TableHeader>
                <TableRow className='bg-accent/60'>
                  <TableHead colSpan={2}>Metric</TableHead>
                  <TableHead colSpan={1.5} className='text-nowrap'>
                    Total value
                  </TableHead>
                  <TableHead
                    className='min-w-[100px] text-nowrap'
                    colSpan={1.5}
                  >
                    Daily update
                  </TableHead>
                  <TableHead className='min-w-[140px]'>Created</TableHead>
                  <TableHead className='w-[50px] text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMetrics.map((metric, i) => {
                  const isBlocked =
                    metricsLimitReached &&
                    (projects[activeProject].metrics?.findIndex(
                      (m) => m.id === metric.id,
                    ) ?? 0) >
                      user.plan.metric_per_project_limit - 1;
                  return (
                    <Item
                      key={metric.id}
                      metric={metric}
                      index={i}
                      blocked={isBlocked}
                    />
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}>Total</TableCell>
                  <TableCell className='text-right'>
                    {filteredMetrics.length}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </>
        )}
      </div>
    </div>
  );
}
const Item = (props: { metric: Metric; index: number; blocked: boolean }) => {
  const [dailyUpdate, setDailyUpdate] = useState<number | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { projects, setProjects, activeProject } = useContext(ProjectsContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [average, setAverage] = useState<number>(0);
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
    const variation = await fetchEventVariation(
      props.metric.projectid,
      props.metric.id,
    );

    if (variation.results === 0) {
      variation.relativeeventcount = props.metric.eventcount;
      variation.relativetotalpos = props.metric.totalpos;
      variation.relativetotalneg = props.metric.totalneg;
    }

    if (props.metric.type === MetricType.Average) {
      setDailyUpdate(variation.averagepercentdiff);

      if (variation.relativeeventcount === 0) {
        setAverage(0);
      } else {
        console.log(variation.relativetotalpos, variation.relativetotalneg);
        setAverage(
          (variation.relativetotalpos - variation.relativetotalneg) /
            variation.relativeeventcount,
        );
      }
    } else {
      setDailyUpdate(variation.pos - variation.neg);
    }

    if (
      (props.metric.totalpos !== variation.relativetotalpos ||
        props.metric.totalneg !== variation.relativetotalneg ||
        props.metric.eventcount !== variation.relativeeventcount) &&
      variation.results !== 0
    ) {
      setProjects(
        projects.map((v) =>
          v.id === props.metric?.projectid
            ? Object.assign({}, v, {
                metrics: v.metrics?.map((m) =>
                  m.id === props.metric?.id
                    ? Object.assign({}, m, {
                        totalpos: variation.relativetotalpos,
                        totalneg: variation.relativetotalneg,
                        eventcount: variation.relativeeventcount,
                      })
                    : m,
                ),
              })
            : v,
        ),
      );
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      load();
    }, INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Dialog open={isEditOpen} onOpenChange={(e) => setIsEditOpen(e)}>
      <TableRow
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
        className={`select-none ${isOpen ? '!bg-blue-500/5' : ''}`}
      >
        {/* Avatar/name */}
        <TableCell className='font-medium' colSpan={2}>
          <div className='flex flex-row items-center gap-[10px] truncate text-[15px]'>
            <div className='rounded-full bg-accent p-2'>
              {isLoading ? (
                <Loader className='size-4 animate-spin text-black' />
              ) : props.metric.type === 0 ? (
                <ArrowUpFromDot className='size-4 text-black' />
              ) : (
                <ArrowUpDown className='size-4 text-black' />
              )}
            </div>
            <div className='w-full truncate'>{props.metric.name}</div>
          </div>
        </TableCell>
        {/* Total value */}
        <TableCell colSpan={1.5}>
          <div className='my-auto line-clamp-1 h-fit w-full items-center font-mono text-[15px]'>
            {props.metric.type === MetricType.Average ? (
              <>{valueFormatter(average)}</>
            ) : (
              <>
                {valueFormatter(props.metric.totalpos - props.metric.totalneg)}
              </>
            )}
          </div>
        </TableCell>
        {/* Daily update */}
        <TableCell>
          <div className='flex items-center'>
            <Badge
              className={`pointer-events-none h-fit w-fit rounded-[6px] bg-zinc-500/10 font-medium text-zinc-500 shadow-none ${todayBadgeColor(
                dailyUpdate,
              )}}`}
            >
              {todayBadgeSign(dailyUpdate)}
              {valueFormatter(dailyUpdate === null ? 0 : dailyUpdate)}
              {props.metric.type === MetricType.Average ? '%' : ''}
            </Badge>
          </div>
        </TableCell>
        {/* Created */}
        <TableCell className='text-nowrap text-secondary'>
          {formattedDate(props.metric.created)}
        </TableCell>
        {/* Actions */}
        <TableCell>
          <MetricDropdown
            metric={props.metric}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          >
            <div className='flex w-full justify-end'>
              <Button
                variant={'ghost'}
                size={'icon'}
                className='size-fit py-2 pl-2 hover:bg-transparent'
                disabled={projects[activeProject].userrole === UserRole.Guest}
              >
                <MoreHorizontal className='size-5' />
              </Button>
            </div>
          </MetricDropdown>
        </TableCell>
      </TableRow>
      <EditMetricDialogContent metric={props.metric} setOpen={setIsEditOpen} />
    </Dialog>
  );
};
