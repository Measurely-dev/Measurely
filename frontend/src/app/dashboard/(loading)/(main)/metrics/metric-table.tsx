'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectsContext } from '@/dash-context';
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
import { FloatingPanelRoot } from '@/components/ui/floating-panel';

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
  const aTotal = a.total_pos - a.total_neg;
  const bTotal = b.total_pos - b.total_neg;
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
            <Table className='overflow-hidden'>
              <TableHeader className=''>
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
                  <TableHead className='min-w-[140px]'>Last updated</TableHead>
                  <TableHead className='w-[50px] text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMetrics.map((metric, i) => {
                  return <Item key={metric.id} metric={metric} index={i} />;
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
            <TableCaption>A list of your metrics.</TableCaption>
          </>
        )}
      </div>
    </div>
  );
}
const Item = (props: { metric: Metric; index: number }) => {
  const [dailyUpdate, setDailyUpdate] = useState<number | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { projects, setProjects, activeProject } = useContext(ProjectsContext);
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
      props.metric.project_id,
      props.metric.id,
    );

    if (variation.results === 0) {
      variation.relative_event_count = props.metric.event_count;
      variation.relative_total_pos = props.metric.total_pos;
      variation.relative_total_neg = props.metric.total_neg;
    }

    if (props.metric.type === MetricType.Average) {
      setDailyUpdate(variation.averagepercentdiff);

      if (variation.relative_event_count === 0) {
        setAverage(0);
      } else {
        setAverage(
          (variation.relative_total_pos - variation.relative_total_neg) /
            variation.relative_event_count,
        );
      }
    } else {
      setDailyUpdate(variation.pos - variation.neg);
    }

    if (
      (props.metric.total_pos !== variation.relative_total_pos ||
        props.metric.total_neg !== variation.relative_total_neg ||
        props.metric.event_count !== variation.relative_event_count) &&
      variation.results !== 0
    ) {
      setProjects(
        projects.map((v) =>
          v.id === props.metric?.project_id
            ? Object.assign({}, v, {
                metrics: v.metrics?.map((m) =>
                  m.id === props.metric?.id
                    ? Object.assign({}, m, {
                        total_pos: variation.relative_total_pos,
                        total_neg: variation.relative_total_neg,
                        event_count: variation.relative_event_count,
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
          setIsLoading(true);
          router.push(
            `/dashboard/metrics/${encodeURIComponent(props.metric.name)}`,
          );
        }}
        className={`select-none`}
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
                {valueFormatter(
                  props.metric.total_pos - props.metric.total_neg,
                )}
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
          {formattedDate(
            props.metric.last_event_timestamp?.V ?? props.metric.created,
          )}
        </TableCell>
        {/* Actions */}
        <TableCell>
          <div className='flex w-full justify-end'>
            <FloatingPanelRoot>
              <MetricDropdown metric={props.metric}>
                <Button
                  variant={'ghost'}
                  size={'icon'}
                  className='hover:bg-transparent'
                  onClick={(e) => e.stopPropagation()}
                  disabled={
                    projects[activeProject].user_role === UserRole.Guest
                  }
                >
                  <MoreHorizontal className='size-5' />
                </Button>
              </MetricDropdown>
            </FloatingPanelRoot>
          </div>
        </TableCell>
      </TableRow>
      <EditMetricDialogContent metric={props.metric} setOpen={setIsEditOpen} />
    </Dialog>
  );
};
