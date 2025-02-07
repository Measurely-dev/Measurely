'use client';

// Import required components and utilities
import DashboardContentContainer from '@/components/container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useEffect, useId, useMemo, useState } from 'react';
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '@/components/ui/sortable';
import {
  BlocksIcon,
  Cuboid,
  GripVertical,
  Group,
  MoreVertical,
  PackagePlus,
  Plus,
  PlusCircle,
  PlusSquare,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useContext } from 'react';
import { ProjectsContext } from '@/dash-context';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AreaChart } from '@/components/ui/area-chart';

import { ComboChart } from '@/components/ui/combo-chart';
import { BarChart } from '@/components/ui/bar-chart';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import Header from '@/components/header';
import { EmptyState } from '@/components/ui/empty-state';

import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Block,
  BlockType,
  ChartPoint,
  ChartType,
  Metric,
  MetricType,
  Project,
} from '@/types';
import { toast } from 'sonner';
import {
    ChartPrecision,
  fetchMetricEvents,
  generateString,
  getMonthsFromDate,
  getUnit,
  processMetricEvents,
  valueFormatter,
} from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import BlockOptions from './block-options';
import BlocksDialog from './block-dialog';
import customTooltip from '@/components/ui/custom-tooltip';

import { colorSchemeMap } from '@/lib/chartUtils';
import {
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  RadarChart,
  Radar,
  Label as RechartLabel,
} from 'recharts';
import { BarList } from '@/components/ui/bar-list';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useCharacterLimit } from '@/lib/character-limit';

// Main dashboard component
export default function DashboardHomePage() {
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const [groupInput, setGroupInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const maxLength = 25;
  const id = useId();

  // Character limit handling
  const {
    value,
    characterCount,
    handleChange: handleCharacterLimitChange,
    maxLength: limit,
  } = useCharacterLimit({ maxLength });

  // Sync groupInput with character limit value
  useEffect(() => {
    setGroupInput(value);
  }, [value]);

  const handleInputChange = (e: any) => {
    handleCharacterLimitChange(e);
    setGroupInput(e.target.value);
  };

  // Update page title and meta description
  useEffect(() => {
    document.title = 'Dashboard | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Welcome to your Measurely Dashboard. Get an overview of your metrics, analyze data trends, and manage your projects all in one place.',
      );
    }
  }, []);

  return (
    <DashboardContentContainer className='mt-0 flex w-full pt-[15px]'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className='pointer-events-none'>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Header
        className='mt-5'
        title='Blocks'
        description='Visual blocks for showcasing metric data and insights on your overview.'
        titleClassName='!text-2xl font-semibold'
      >
        <div className='flex gap-2 rounded-[14px]'>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div
              onClick={() => {
                if (projects[activeProject].metrics?.length === 0) {
                  toast.warning(
                    'Please create one or more metrics before adding a block group.',
                  );
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  disabled={projects[activeProject].metrics?.length === 0}
                  variant={'secondary'}
                  className='rounded-[12px] bg-background hover:bg-background'
                >
                  <Group className='mr-2 size-4' />
                  Create group
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new group</DialogTitle>
                <DialogDescription>
                  A Block Group organizes multiple blocks into a single
                  category, making it easier to manage and view related data.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-2'>
                <Label htmlFor={id}>Group name</Label>
                <div className='relative'>
                  <Input
                    id={id}
                    className='peer h-11 rounded-[12px] pe-14'
                    type='text'
                    placeholder='Group name...'
                    value={groupInput}
                    maxLength={maxLength}
                    onChange={handleInputChange}
                    aria-describedby={`${id}-description`}
                  />
                  <div
                    id={`${id}-description`}
                    className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50'
                    aria-live='polite'
                    role='status'
                  >
                    {characterCount}/{limit}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button className='rounded-[12px]' variant={'secondary'}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    const project = projects[activeProject];
                    const newBlock: Block = {
                      id: 0,
                      name: groupInput,
                      type: BlockType.Group,
                      nested: [],
                      metric_ids: [],
                      filter_categories: [],
                      label: 'group',
                      unique_key: generateString(10),
                      color: '',
                    };
                    let layoutCopy = project.blocks?.layout;
                    if (layoutCopy === undefined) layoutCopy = [];
                    layoutCopy.unshift(newBlock);
                    for (let i = 0; i < layoutCopy.length; i++) {
                      layoutCopy[i].id = i;
                    }
                    setIsDialogOpen(false);
                    setGroupInput('');
                    setProjects(
                      projects.map((proj, i) =>
                        i === activeProject
                          ? Object.assign({}, proj, {
                              blocks: Object.assign({}, proj.blocks, {
                                layout: layoutCopy,
                              }),
                            })
                          : proj,
                      ),
                    );
                  }}
                  className='rounded-[12px]'
                  disabled={groupInput === ''}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div
            onClick={() => {
              if (projects[activeProject].metrics?.length === 0) {
                toast.warning(
                  'Please create one or more metrics before adding a block.',
                );
              }
            }}
          >
            <BlocksDialog type='wide'>
              <Button
                disabled={projects[activeProject].metrics?.length === 0}
                className='rounded-[12px]'
              >
                <PackagePlus className='mr-2 size-4' />
                Create block
              </Button>
            </BlocksDialog>
          </div>
        </div>
      </Header>
      <Blocks />
    </DashboardContentContainer>
  );
}

// Style utilities
const cardStyle = (color: string) => ({
  borderColor: `${color}1A`,
  backgroundColor: `${color}0D`,
  color,
});

const buttonStyle = (color: string, isHovered: boolean, isOpen?: boolean) => ({
  backgroundColor: isHovered || isOpen ? `${color}0D` : `${color}00`,
  borderColor: isHovered || isOpen ? `${color}33` : ``,
  color,
  transition: 'background-color 0.3s, border-color 0.3s',
});

// Blocks container component
function Blocks() {
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch and sync blocks data
  useEffect(() => {
    if (projects[activeProject]) {
      if (projects[activeProject].blocks === null) {
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blocks/${projects[activeProject].id}`,
          { method: 'GET', credentials: 'include' },
        )
          .then((resp) => {
            if (resp.ok) {
              return resp.json();
            } else {
              resp.text().then((text) => {
                toast.error(text);
              });
            }
          })
          .then((data) => {
            if (data !== null && data !== undefined) {
              setProjects(
                projects.map((proj, i) =>
                  i === activeProject
                    ? Object.assign({}, proj, { blocks: data })
                    : proj,
                ),
              );
            }
          });
      } else {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/blocks/layout`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_layout: projects[activeProject].blocks?.layout ?? [],
            new_labels: projects[activeProject].blocks?.labels ?? [],
            project_id: projects[activeProject].id,
          }),
        });
      }
    }
  }, [projects, activeProject]);

  return (
    <div className='mt-5 pb-20'>
      {projects[activeProject].blocks?.layout.length === 0 ? (
        <EmptyState
          title='No blocks available'
          description='You have no blocks available in this project. Create a new block or group to get started.'
          icons={[Cuboid, Plus, BlocksIcon]}
          className='flex !size-full min-h-[400px] flex-col items-center justify-center bg-transparent'
          action={{
            label: 'Create new block',
            onClick: () => setIsDialogOpen(true),
            disabled: projects[activeProject].metrics?.length === 0,
          }}
        />
      ) : projects[activeProject].blocks === null ? (
        <div className='flex flex-col gap-5'>
          <Skeleton className='h-[56vh] w-full rounded-[12px]' />
          <Skeleton className='h-[56vh] w-full rounded-[12px]' />
          <Skeleton className='h-[56vh] w-full rounded-[12px]' />
        </div>
      ) : (
        <Sortable
          orientation='vertical'
          value={projects[activeProject].blocks?.layout ?? []}
          strategy={rectSortingStrategy}
          onValueChange={(value) => {
            setProjects(
              projects.map((proj, i) =>
                i === activeProject
                  ? Object.assign({}, proj, {
                      blocks: Object.assign({}, proj.blocks, {
                        layout: value,
                      }),
                    })
                  : proj,
              ),
            );
          }}
          overlay={<div className='size-full rounded-[12px] bg-primary/5' />}
        >
          <div className='grid grid-cols-3 gap-4'>
            {projects[activeProject].blocks?.layout.map((block) => (
              <IndividualBlock key={block.unique_key} {...block} />
            ))}
          </div>
        </Sortable>
      )}
      <BlocksDialog
        type='wide'
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}

// Individual block component
function IndividualBlock(props: Block & { groupkey?: string }) {
  return (
    <SortableItem value={props.id} asChild>
      <div
        className={`overflow-x-auto`}
        style={{
          gridColumn:
            props.type !== BlockType.Nested
              ? 'span 3 / span 3'
              : 'span 1 / span 1',
        }}
      >
        <Card
          className={`flex w-full min-w-[900px] flex-col rounded-[12px] bg-accent shadow-sm shadow-black/5 ${props.type === BlockType.Group ? 'min-w-[1000px] !bg-accent/50' : ''} ${props.type === BlockType.Nested ? 'rounded[10px] min-w-[280px]' : ''}`}
          style={cardStyle(props.color)}
        >
          <BlockContent {...props} />
        </Card>
      </div>
    </SortableItem>
  );
}

// Block content component
function BlockContent(props: Block & { groupkey?: string }) {
  const [isHoveredMore, setIsHoveredMore] = useState(false);
  const [isHoveredDrag, setIsHoveredDrag] = useState(false);
  const [isOpen, setIsOpen] = useState(isHoveredMore);
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const [chartData, setChartData] = useState<ChartPoint[] | null>(null);
  const [range, setRange] = useState(7);
  const [isCopying, setIsCopying] = useState(false);
  const [disabledItem, setDisabledItem] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  // Function to delete a block from the project layout
  // Handles both nested blocks (within groups) and default blocks
  const deleteBlock = () => {
    if (props.type === BlockType.Nested) {
      // For nested blocks, filter out the block from its parent group's nested array
      setProjects(
        projects.map((proj, i) =>
          i === activeProject
            ? {
                ...proj,
                blocks: {
                  ...proj.blocks,
                  layout: proj.blocks?.layout.map((l) =>
                    l.unique_key === props.groupkey
                      ? {
                          ...l,
                          nested: l.nested?.filter(
                            (n) => n.unique_key != props.unique_key,
                          ),
                        }
                      : l,
                  ),
                },
              }
            : proj,
        ) as Project[],
      );
    } else if (props.type === BlockType.Default) {
      // For default blocks, filter out the block from the main layout array
      setProjects(
        projects.map((proj, i) =>
          i === activeProject
            ? {
                ...proj,
                blocks: {
                  ...proj.blocks,
                  layout: proj.blocks?.layout.filter(
                    (block) => block.unique_key != props.unique_key,
                  ),
                },
              }
            : proj,
        ) as Project[],
      );
    }
  };

  // Memoized metrics calculation for the current block
  // Maps metric IDs to actual metric objects and filters out undefined metrics
  // Also handles automatic deletion of blocks with no metrics
  const metrics = useMemo(() => {
    const result = props.metric_ids
      .map((id) => projects[activeProject].metrics?.find((m) => m.id === id))
      .filter((m) => m !== undefined) as Metric[];

    if (result.length === 0 && props.type !== BlockType.Group) {
      // Delete the block if all the referenced metrics have been deleted
      deleteBlock();
    }

    return result;
  }, [props.metric_ids, projects, activeProject]);

  // Calculates summary values for different metric types (Base, Dual, Average)
  // Returns a single numerical value representing the metric summary
  function calculateSummary(data: any[], metric: Metric): number {
    let totalpos = 0; // Accumulator for positive values
    let totalneg = 0; // Accumulator for negative values
    let eventcount = 0; // Counter for events (used in Average metrics)

    // Iterate through data points and accumulate values based on metric type
    for (let i = 0; i < data.length; i++) {
      if (metric.type === MetricType.Base) {
        totalpos += data[i][metric.name] ?? 0;
      } else if (metric.type === MetricType.Dual) {
        totalpos += data[i][metric.name_pos ?? ''] ?? 0;
        totalneg += data[i][metric.name_neg ?? ''] ?? 0;
      } else if (metric.type === MetricType.Average) {
        totalpos += data[i][metric.name + '+'] ?? 0;
        totalneg += data[i][metric.name + '-'] ?? 0;
        eventcount += data[i][metric.name + 'Event Count'] ?? 0;
      }
    }

    // Calculate final value based on metric type
    if (metric.type === MetricType.Average) {
      return eventcount === 0 ? 0 : (totalpos - totalneg) / eventcount;
    }

    return totalpos - totalneg;
  }

  // Load chart data
  useEffect(() => {
    const loadData = async () => {
      if (metrics.length === 0) return;

      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - (range - 1));
      const promises = metrics.map(async (metric) => {
        const data = await fetchMetricEvents(
          start,
          end,
          metric,
          metric.project_id,
        );

        let precision: ChartPrecision = 'W';
        if (range === 7) precision = 'W';
        else if (range === 15) precision = '15D';
        else if (range === 30) precision = 'M';

        return processMetricEvents(
          null,
          data,
          'event',
          precision,
          start,
          metric,
        );
      });

      const results = await Promise.all(promises);
      const length = results[0].length; // Assuming all arrays have the same length
      const combined: ChartPoint[] = Array.from({ length }, (_, i) =>
        results.reduce(
          (acc: any, curr) => ({
            ...acc,
            ...curr[i],
            metadata: { ...acc.metadata, ...curr[i].metadata }, // Merge nested metadata
          }),
          {},
        ),
      ) as ChartPoint[];

      console.log(combined);

      setChartData(combined);
    };

    loadData();
  }, [metrics, range]);

  // Handle metric value copying
  const handleCopy = (metric: Metric) => {
    if (isCopying) return;

    setIsCopying(true);

    navigator.clipboard.writeText(
      String(calculateSummary(chartData ?? [], metric)),
    );
    toast.success('Successfully copied metric value to clipboard.');

    setTimeout(() => {
      setIsCopying(false);
    }, 1000);
  };

  // Calculate percentage change for compact blocks
  const calculateCompactBlockPourcentage = (data: any[]) => {
    if (metrics.length === 0) return;
    let categoryTotal = 0;
    let categoryEventCount = 0;
    let categoryVariation = 0;
    let categoryEventCountVariation = 0;
    for (let i = 0; i < (data?.length ?? 0); i++) {
      categoryTotal += data[i].metadata.relative_total ?? 0;
      categoryVariation += data[i][metrics[0].name] ?? 0;
      categoryEventCount += data[i].metadata.relative_event_count ?? 0;
      categoryEventCountVariation += data[i].metadata.event_count ?? 0;
    }

    const calculateAverage = (numerator: number, denominator: number) => {
      if (numerator === 0 || denominator === 0) return 0;
      return numerator / denominator;
    };

    const previousTotal = categoryTotal - categoryVariation;
    const previousEventCount = categoryEventCount - categoryEventCountVariation;

    if (metrics[0].type === MetricType.Average) {
      const average = calculateAverage(categoryVariation, categoryEventCount);
      const previousAverage = calculateAverage(
        previousTotal,
        previousEventCount,
      );

      const diff = average - previousAverage;
      if (diff === 0 && previousAverage === 0) return 0;
      if (previousAverage === 0) return 100 * (average < 0 ? -1 : 1);
      return (diff / previousAverage) * 100;
    } else {
      if (categoryVariation === 0) return 0;
      if (previousTotal === 0) {
        return 100 * (categoryTotal < 0 ? -1 : 1);
      }

      return (categoryVariation / previousTotal) * 100;
    }
  };

  return (
    <>
      <CardHeader
        className={`border-b px-3 py-2`}
        style={{ borderColor: `${props.color}33` }}
      >
        <div className='flex w-full items-center gap-2 p-0'>
          <SortableDragHandle
            variant={'ghost'}
            size={'icon'}
            className='rounded-[12px]'
            style={buttonStyle(props.color, isHoveredDrag)}
            onMouseEnter={() => setIsHoveredDrag(true)}
            onMouseLeave={() => setIsHoveredDrag(false)}
          >
            <GripVertical className='size-5' />
          </SortableDragHandle>
          <Badge
            variant='outline'
            className='truncate capitalize'
            style={cardStyle(props.color)}
          >
            {props.label}
          </Badge>
          {props.type === BlockType.Group ? (
            <div className='flex flex-row items-center gap-4 text-sm font-medium capitalize'>
              <Separator orientation='vertical' className='ml-2 h-4' />{' '}
              {props.name}
            </div>
          ) : (
            <></>
          )}
          <BlockOptions {...props} setIsOpen={setIsOpen}>
            <Button
              size={'icon'}
              variant={'ghost'}
              style={buttonStyle(props.color, isHoveredMore, isOpen)}
              className='ml-auto rounded-[12px]'
              onMouseEnter={() => setIsHoveredMore(true)}
              onMouseLeave={() => setIsHoveredMore(false)}
            >
              <MoreVertical className='size-5 p-0' />
            </Button>
          </BlockOptions>
        </div>
      </CardHeader>
      {props.type === BlockType.Group || props.type === BlockType.Nested ? (
        <></>
      ) : (
        <>
          <div
            className='mb-5 flex h-[90px] w-full flex-row items-center justify-between gap-5 border-b pl-6'
            style={{ borderColor: `${props.color}33` }}
          >
            <div className='flex flex-row items-center gap-4'>
              <CardTitle className='!m-0 !p-0 text-xl'>{props.name}</CardTitle>
              <Select
                defaultValue='7'
                onValueChange={(value) => setRange(parseInt(value))}
              >
                <SelectTrigger
                  className='w-[140px] border'
                  style={cardStyle(props.color)}
                >
                  <SelectValue placeholder='Select a range' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='7'>Last 7 days</SelectItem>
                    <SelectItem value='15'>Last 15 days</SelectItem>
                    <SelectItem value='30'>Last 30 days</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {props.chart_type !== ChartType.Pie &&
            props.chart_type !== ChartType.Radar &&
            props.chart_type !== ChartType.BarList ? (
              <div className='flex h-full flex-row items-center'>
                {metrics.map((metric, i) => {
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setDisabledItem(metric.name);
                        handleCopy(metric);
                        setTimeout(() => {
                          setDisabledItem(null);
                        }, 1000);
                      }}
                      className={`group relative flex h-full w-fit min-w-[120px] select-none flex-col items-start justify-center gap-0.5 overflow-x-hidden whitespace-nowrap border-l px-5 font-mono text-2xl font-bold`}
                      style={{ borderColor: `${props.color}33` }}
                    >
                      <div
                        className={`absolute left-0 top-0 size-full bg-current opacity-0 group-hover:opacity-10 ${disabledItem === metric.name ? 'cursor-wait opacity-10' : 'cursor-copy'}`}
                      />
                      <div className='whitespace-nowrap font-sans text-xs font-normal'>
                        {metric.name}
                      </div>
                      {valueFormatter(
                        calculateSummary(chartData ?? [], metric),
                      )}{' '}
                      {getUnit(metric.unit)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <></>
            )}
          </div>
        </>
      )}

      {props.type === BlockType.Nested ? (
        <CardHeader className='items-center pb-0'>
          <CardTitle>
            {props.filter_categories[0].charAt(0).toUpperCase() +
              props.filter_categories[0].slice(1).toLowerCase()}
          </CardTitle>
          <CardDescription>
            {getMonthsFromDate(date)} - {date.getFullYear()}
          </CardDescription>
        </CardHeader>
      ) : undefined}

      {props.nested !== undefined && props.nested !== null && (
        <NestedBlocks {...props} />
      )}

      {props.type !== BlockType.Group && (
        <CardContent
          className={`relative h-[30vh] min-h-[240px] ${props.chart_type !== ChartType.BarList ? 'flex items-center justify-center' : ''} ${props.type === BlockType.Nested ? 'mt-5 h-[35vh]' : ''}`}
        >
          <Charts
            chartType={props.chart_type}
            data={chartData ?? []}
            color={props.color}
            metrics={metrics}
            categories={
              metrics.length === 0
                ? undefined
                : props.filter_categories.every((category) =>
                      Object.keys(metrics[0].filters ?? {}).includes(category),
                    )
                  ? props.filter_categories
                  : []
            }
          />
        </CardContent>
      )}

      {props.type !== BlockType.Nested ? (
        <></>
      ) : (
        <CardFooter
          className={`flex-col gap-2 text-sm ${
            props.type === BlockType.Nested
              ? 'items-center text-center'
              : 'items-start'
          }`}
        >
          <div className={`flex gap-2 font-medium leading-none`}>
            Trending up by {calculateCompactBlockPourcentage(chartData ?? [])}%
            this month <TrendingUp className='h-4 w-4' />
          </div>
          <div className='leading-none text-muted-foreground'>
            Showing total{' '}
            {metrics.length === 0 ? 'Not Found' : metrics[0].name.toLowerCase()}{' '}
            for the last month
          </div>
        </CardFooter>
      )}
    </>
  );
}
// Type definition for available chart colors
export type ColorKey =
  | 'pink'
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'cyan'
  | 'indigo'
  | 'magenta'
  | 'violet'
  | 'lime'
  | 'purple'
  | 'fuchsia'
  | 'gray';

// Maps hex color codes to color keys
const hexToColorKeyMap: Record<string, ColorKey> = {
  '#ff007f': 'pink',
  '#0033cc': 'blue',
  '#8000ff': 'purple',
  '#007f3f': 'green',
  '#ff6600': 'orange',
  '#cc0000': 'red',
  '#cc9900': 'yellow',
  '#00cccc': 'cyan',
  '#3a2fbf': 'indigo',
  '#cc00cc': 'magenta',
};

// Defines color palettes for each base color
const chartColorMap: Record<ColorKey, ColorKey[]> = {
  pink: ['pink', 'fuchsia', 'blue', 'red'],
  blue: ['blue', 'cyan', 'pink', 'violet'],
  green: ['green', 'lime', 'cyan', 'blue'],
  orange: ['orange', 'magenta', 'red', 'violet'],
  red: ['red', 'pink', 'orange', 'violet'],
  yellow: ['yellow', 'green', 'cyan', 'blue'],
  cyan: ['cyan', 'blue', 'green', 'pink'],
  indigo: ['indigo', 'violet', 'blue', 'cyan'],
  magenta: ['fuchsia', 'pink', 'violet', 'red'],
  fuchsia: ['fuchsia', 'pink', 'red', 'magenta'],
  purple: ['fuchsia', 'pink', 'violet', 'indigo'],
  violet: ['violet', 'indigo', 'blue', 'pink'],
  lime: ['lime', 'green', 'yellow', 'cyan'],
  gray: ['gray', 'pink', 'blue', 'green'],
};

// Maps color keys to specific hex values for compact charts
const CompactChartColorMap: Record<ColorKey, string> = {
  pink: '#d6336c',
  blue: '#0056b3',
  green: '#007f3f',
  orange: '#d35400',
  red: '#b71c1c',
  yellow: '#f57f17',
  cyan: '#006064',
  indigo: '#283593',
  magenta: '#880e4f',
  fuchsia: '#9c27b0',
  purple: '#6a1b9a',
  violet: '#4a148c',
  lime: '#33691e',
  gray: '#424242',
};

// Creates configuration for pie chart labels
function createDynamicPieChartConfig(dataKeys: any, _: string[]) {
  return dataKeys.reduce((config: any, key: any, _: number) => {
    config[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: 'blue',
    };
    return config;
  }, {});
}

// Main chart rendering component that handles different chart types
function Charts(props: {
  chartType: ChartType | undefined;
  data: any[];
  color: string;
  metrics: Metric[];
  categories?: string[];
}) {
  const chartProps = {
    className: 'h-full',
    valueFormatter,
  };

  // Resolve color settings
  const resolvedColorKey = hexToColorKeyMap[props.color] || 'gray';
  const validResolvedColorKey =
    resolvedColorKey in colorSchemeMap ? resolvedColorKey : 'gray';
  const chartColors = chartColorMap[validResolvedColorKey];

  const compactValidResolvedColorKey =
    resolvedColorKey in colorSchemeMap ? resolvedColorKey : 'gray';
  const compactChartColor = CompactChartColorMap[compactValidResolvedColorKey];

  // Render appropriate chart based on type
  switch (props.chartType) {
    case ChartType.Area:
      return (
        <AreaChart
          data={props.data ?? []}
          {...chartProps}
          customTooltip={customTooltip}
          colors={chartColors}
          index='date'
          categories={props.metrics.map((m) => m.name)}
          yAxisLabel='Total'
          onValueChange={() => {}}
        />
      );
    case ChartType.Bar:
      return (
        <BarChart
          data={props.data}
          {...chartProps}
          customTooltip={customTooltip}
          colors={chartColors}
          index='date'
          categories={props.metrics.map((m) => m.name)}
          yAxisLabel='Total'
          onValueChange={() => {}}
        />
      );
    case ChartType.Combo:
      return (
        <ComboChart
          data={props.data}
          {...chartProps}
          index='date'
          enableBiaxial
          barSeries={{
            categories: [
              props.metrics.length === 0 ? '' : props.metrics[0].name,
            ],
            showYAxis: true,
            colors: [chartColors[0]],
          }}
          lineSeries={{
            categories: [props.metrics.length < 2 ? '' : props.metrics[1].name],
            showYAxis: true,
            colors: [chartColors[2]],
          }}
          onValueChange={() => {}}
        />
      );
    case ChartType.BarList:
      return (
        <BarList
          data={props.data
            .slice()
            .sort((a, b) => {
              if (a === props.data[props.data.length - 1]) return 1;
              if (b === props.data[props.data.length - 1]) return -1;
              return b.value - a.value;
            })
            .slice(0, 7)}
          {...chartProps}
          color={`${compactChartColor}`}
        />
      );
    case ChartType.Pie:
      if (!props.categories || props.categories.length === 0) return;

      const pieChartConfig = createDynamicPieChartConfig(
        props.metrics[0].filters?.[props.categories?.[0] ?? ''].map(
          (filter) => filter.name,
        ) ?? [],
        chartColors,
      );
      const noDataPieChartConfig = {
        desktop: {
          color: compactChartColor,
        },
      };

      const PieChartFakeData = [
        { region: 'safari', visitors: 200, fill: `${compactChartColor}4D` },
      ];
      return (
        <>
          {props.data.reduce(
            (sum, item) => sum + item[props.metrics[0].name],
            0,
          ) !== 0 ? (
            <ChartContainer
              config={pieChartConfig}
              className='mx-auto h-full w-full'
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={props.data ?? []}
                  dataKey={
                    props.metrics.length === 0 ? '' : props.metrics[0].name
                  }
                  nameKey={props.categories?.[0]}
                  innerRadius={60}
                  strokeWidth={5}
                  fill='grey'
                >
                  <RechartLabel
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor='middle'
                            dominantBaseline='middle'
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              style={{ fill: compactChartColor }}
                              className='text-3xl font-bold'
                            >
                              {props.data?.reduce(
                                (sum, item) =>
                                  sum +
                                  item[
                                    props.metrics.length === 0
                                      ? ''
                                      : props.metrics[0].name
                                  ],
                                0,
                              )}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              style={{ fill: compactChartColor }}
                            >
                              {props.metrics[0].name}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <div className='pointer-events-none absolute h-full w-full'>
              <ChartContainer
                config={noDataPieChartConfig}
                className='mx-auto h-full w-full'
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={PieChartFakeData}
                    dataKey='visitors'
                    nameKey='region'
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <RechartLabel
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor='middle'
                              dominantBaseline='middle'
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                style={{ fill: compactChartColor }}
                                className='text-3xl font-bold'
                              >
                                0
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                style={{ fill: compactChartColor }}
                              >
                                No data
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          )}
        </>
      );
    case ChartType.Radar:
      if (!props.categories || props.categories.length === 0) return;

      return (
        <ChartContainer
          config={{} as ChartConfig}
          className='mx-auto h-full w-full'
        >
          <RadarChart data={props.data ?? []}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid
              className='opacity-20'
              style={{ fill: compactChartColor }}
              gridType='polygon'
            />
            <PolarAngleAxis dataKey={props.categories?.[0]} />
            <Radar
              dataKey={props.metrics.length === 0 ? '' : props.metrics[0].name}
              fill={compactChartColor}
              fillOpacity={0.5}
            />
          </RadarChart>
        </ChartContainer>
      );
    default:
      return <div>No chart available for this type.</div>;
  }
}

// Component for handling nested block layouts
function NestedBlocks(props: Block) {
  const { setProjects, projects, activeProject } = useContext(ProjectsContext);
  return (
    <Sortable
      orientation='horizontal'
      value={props.nested ?? []}
      strategy={rectSortingStrategy}
      onValueChange={(value) => {
        setProjects(
          projects.map((proj, i) =>
            i === activeProject
              ? Object.assign({}, proj, {
                  blocks: Object.assign({}, proj.blocks, {
                    layout: proj.blocks?.layout.map((l) =>
                      l.unique_key === props.unique_key
                        ? Object.assign({}, l, {
                            nested: value,
                          })
                        : l,
                    ),
                  }),
                })
              : proj,
          ),
        );
      }}
      overlay={<div className='size-full rounded-[12px] bg-primary/5' />}
    >
      <div className='grid grid-cols-3 gap-4 overflow-y-scroll p-3'>
        {props.nested?.map((block) => (
          <IndividualBlock
            key={block.unique_key}
            groupkey={props.unique_key}
            {...block}
          />
        ))}
        {(props.nested ? props.nested.length : 0) < 3 ? (
          <BlocksDialog type='compact' groupkey={props.unique_key}>
            <div className='h-full cursor-pointer select-none'>
              <EmptyState
                title='Add new block'
                description='Add a new block to this group.'
                icons={[PlusCircle, Plus, PlusSquare]}
                className='flex !size-full max-h-none min-w-[320px] flex-col items-center justify-center bg-transparent'
              />
            </div>
          </BlocksDialog>
        ) : undefined}
      </div>
    </Sortable>
  );
}
