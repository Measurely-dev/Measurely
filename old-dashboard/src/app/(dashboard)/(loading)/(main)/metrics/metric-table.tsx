'use client';
// UI Component Imports
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectsContext } from '@/dash-context';
import { Metric, MetricType, UserRole } from '@/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal } from 'react-feather';
import { formatDistanceToNow } from 'date-fns';
import MetricDropdown from '@/components/metric-dropdown';
import {
  calculateAverageUpdate,
  calculateEventUpdate,
  fetchMetricEvents,
  getUnit,
  INTERVAL,
} from '@/utils';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpFromDot,
  FileQuestion,
  Loader,
  Minus,
  Search,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import EditMetricDialogContent from '@/components/edit-metric-dialog-content';
import { FloatingPanelRoot } from '@/components/ui/floating-panel';

// Formats a date to relative time (e.g. "2 hours ago")
const formattedDate = (date: Date) => {
  try {
    return formatDistanceToNow(date, { addSuffix: true, includeSeconds : true });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

// Sorts metrics by creation date
function sortbyDate(a: Metric, b: Metric, order: string): number {
  if (a.last_event_timestamp < b.last_event_timestamp) {
    return order === 'new' ? 1 : -1;
  } else if (a.last_event_timestamp > b.last_event_timestamp) {
    return order === 'new' ? -1 : 1;
  }
  return 0;
}

// Formats numbers with proper locale-specific formatting
const valueFormatter = (number: number) => {
  if (typeof number === 'number' && !Number.isInteger(number)) {
    return number.toFixed(2);
  }
  return Intl.NumberFormat('us').format(number).toString();
};

// Sorts metrics by their total value (positive - negative)
function sortByTotal(a: Metric, b: Metric): number {
  const aTotal = a.total_pos - a.total_neg;
  const bTotal = b.total_pos - b.total_neg;
  if (aTotal < bTotal) return 1;
  if (aTotal > bTotal) return -1;
  return sortbyDate(a, b, 'new');
}

// Main metric table component that displays all metrics
export default function MetricTable(props: { search: string; filter: string }) {
  const { projects, activeProject } = useContext(ProjectsContext);

  // Memoized filtered and sorted metrics based on search and filter props
  const filteredMetrics = useMemo(() => {
    return (
      projects[activeProject].metrics
        ?.sort((a, b) => {
          if (props.filter === 'new' || props.filter === 'old') {
            return sortbyDate(a, b, props.filter);
          } else if (props.filter === 'total') {
            return sortByTotal(a, b);
          }
          return 0;
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
              <TableHeader>
                <TableRow className='bg-accent dark:bg-card dark:hover:bg-card'>
                  <TableHead colSpan={2}>Metric</TableHead>
                  <TableHead colSpan={1.5} className='text-nowrap'>
                    Value
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
                {filteredMetrics.map((metric, i) => (
                  <Item key={metric.id} metric={metric} index={i} />
                ))}
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
            <div className='mx-auto mt-3 text-sm text-muted-foreground'>
              A list of your metrics.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Individual metric row component
const Item = (props: { metric: Metric; index: number }) => {
  const [dailyUpdate, setDailyUpdate] = useState<number | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { projects, activeProject } = useContext(ProjectsContext);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [value, setValue] = useState<number>(0);

  // Determines badge color based on value
  const todayBadgeColor = (v: number | null) => {
    if (v === null || v === 0) return '';
    return v > 0
    ? 'bg-green-100 border-green-500 dark:bg-green-500/30 dark:text-green-500 text-green-600'
    : 'bg-red-100 border-red-500 dark:bg-red-500/30 dark:text-red-500 text-red-600';
  };

  // Determines if a plus sign should be shown before positive values
  const todayBadgeSign = (v: number | null) => {
    if (v === null || v === 0 || v < 0)
      return <Minus className='-ml-0.5 size-4' aria-hidden={true} />;
    return v < 0 ? (
      <ArrowDown className='-ml-0.5 size-4' aria-hidden={true} />
    ) : (
      <ArrowUp className='-ml-0.5 size-4' aria-hidden={true} />
    );
  };

  // Fetches and updates metric data
  const load = async () => {
    const start = new Date();
    const end = new Date();

    const data = await fetchMetricEvents(
      start,
      end,
      props.metric,
      props.metric.project_id,
    );
    if (props.metric.type === MetricType.Average) {
      setDailyUpdate(calculateAverageUpdate(data, props.metric));
      setValue(
        props.metric.event_count === 0
          ? 0
          : (props.metric.total_pos - props.metric.total_neg) /
              props.metric.event_count,
      );
    } else {
      setDailyUpdate(calculateEventUpdate(data, props.metric));
      setValue(props.metric.total_pos - props.metric.total_neg);
    }
  };

  // Load data initially and set up periodic refresh
  useEffect(() => {
    load();
    const interval = setInterval(load, INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={isEditOpen} onOpenChange={(e) => setIsEditOpen(e)}>
      <TableRow
        onClick={() => {
          setIsLoading(true);
          router.push(
            `/metrics/${encodeURIComponent(props.metric.name)}`,
          );
        }}
        className={`select-none`}
      >
        <TableCell className='font-medium' colSpan={2}>
          <div className='flex flex-row items-center gap-[10px] truncate text-[15px]'>
            <div className='rounded-full bg-accent p-2'>
              {isLoading ? (
                <Loader className='size-4 animate-spin text-primary' />
              ) : props.metric.type === 0 ? (
                <ArrowUpFromDot className='size-4 text-primary' />
              ) : (
                <ArrowUpDown className='size-4 text-primary' />
              )}
            </div>
            <div className='w-full truncate'>{props.metric.name}</div>
          </div>
        </TableCell>
        <TableCell colSpan={1.5}>
          <div className='my-auto line-clamp-1 h-fit w-full items-center font-mono text-[15px]'>
            {valueFormatter(value)}
            <span className='ml-1 text-sm'>{getUnit(props.metric.unit)}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className='flex items-center'>
            <Badge
              className={`pointer-events-none h-fit w-fit rounded-[6px] bg-zinc-500/10 font-medium text-zinc-500 shadow-none ${todayBadgeColor(
                dailyUpdate,
              )}}`}
            >
              {todayBadgeSign(dailyUpdate)}
              {valueFormatter(dailyUpdate === null ? 0 : dailyUpdate) + ' %'}
            </Badge>
          </div>
        </TableCell>
        <TableCell className='text-nowrap text-muted-foreground'>
          {formattedDate(props.metric.last_event_timestamp)}
        </TableCell>
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
