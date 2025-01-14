'use client';
import DashboardContentContainer from '@/components/dashboard/container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useEffect, useMemo, useState } from 'react';
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
  Rocket,
  Sparkle,
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
import { ProjectsContext, UserContext } from '@/dash-context';
import PlansDialog from '@/components/dashboard/plans-dialog';
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
import {
  BarListData,
  ComboChartData,
  PieChartData,
  RadarChartData,
} from '@/components/global/block-fake-data';
import { ComboChart } from '@/components/ui/combo-chart';
import { BarChart } from '@/components/ui/bar-chart';
import { BarList } from '@/components/ui/bar-list';
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
import Header from '@/components/dashboard/header';
import { EmptyState } from '@/components/ui/empty-state';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Label as RechartLabel,
} from 'recharts';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Block, BlockType, ChartType, Metric, MetricType } from '@/types';
import { toast } from 'sonner';
import { fetchChartData, generateString } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import BlockOptions from './block-options';
import BlocksDialog from './block-dialog';

export default function DashboardHomePage() {
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const [groupInput, setGroupInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      <UpgradeCard />
      <Header
        className='mb-5 mt-10'
        title='Blocks'
        description='Visual blocks for showcasing metric data and insights on your overview.'
        titleClassName='!text-2xl font-semibold'
      >
        <div className='flex gap-2 max-sm:grid max-sm:grid-cols-2'>
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
                  className='rounded-[12px]'
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
              <div className='flex flex-col gap-2'>
                <Label>Group name</Label>
                <Input
                  placeholder='Group name...'
                  className='h-11 rounded-[12px]'
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value.trimStart())}
                  maxLength={25}
                />
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button className='rounded-[12px]' variant={'secondary'}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                    setGroupInput('');
                    setProjects(
                      projects.map((proj, i) =>
                        i === activeProject
                          ? Object.assign({}, proj, {
                              blocks: Object.assign({}, proj.blocks, {
                                layout: [
                                  ...(proj.blocks === null
                                    ? []
                                    : proj.blocks.layout),
                                  {
                                    id:
                                      proj.blocks === null
                                        ? 1
                                        : proj.blocks.layout.length + 1,
                                    name: groupInput,
                                    type: BlockType.Group,
                                    nested: [],
                                    metricIds: {},
                                    label: 'group',
                                    uniquekey: generateString(10),
                                  },
                                ],
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

function UpgradeCard() {
  const { user } = useContext(UserContext);
  function render() {
    switch (user?.plan.identifier) {
      case 'starter':
        return (
          <Card className='mt-5 rounded-[12px] border-none bg-black'>
            <CardContent className='flex flex-row items-center justify-between gap-5 p-5 max-md:flex-col'>
              <div className='flex flex-col max-md:w-full'>
                <div className='flex flex-row items-center gap-3'>
                  <Rocket className='size-5 text-white' />
                  <div className='text-md font-semibold text-white'>
                    You're using the {user?.plan.name} plan
                  </div>
                </div>
                <div className='text-sm text-white/70'>
                  You can unlock your limits by upgrading to the next plan.
                </div>
              </div>
              <PlansDialog>
                <Button
                  className='rounded-[12px] !bg-background !text-primary hover:opacity-80 max-md:w-full'
                  variant={'default'}
                >
                  Upgrade
                </Button>
              </PlansDialog>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card className='mt-5 animate-gradient rounded-[12px] rounded-b-none border-none bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500'>
            <CardContent className='flex flex-row items-center justify-between gap-5 p-5 max-md:flex-col'>
              <div className='flex flex-col max-md:w-full'>
                <div className='flex flex-row items-center gap-3'>
                  <div className='flex flex-row items-center gap-1 rounded-full bg-accent p-1 px-2 text-xs font-medium'>
                    <Sparkle className='size-3' />
                    {user?.plan.name}
                  </div>
                  <div className='text-md font-semibold text-white'>
                    Welcome back,{' '}
                    <span className='font-semibold capitalize'>
                      {user?.firstname}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  }
  return render();
}

const cardStyle = (color: string) => ({
  borderColor: `${color}1A`,
  backgroundColor: `${color}0D`,
  color,
});

const buttonStyle = (color: string, isHovered: boolean, isOpen?: boolean) => ({
  backgroundColor: isHovered || isOpen ? `${color}0D` : `${color}00`,
  color,
  transition: 'background-color 0.3s, border-color 0.3s',
});

const valueFormatter = (number: number) =>
  Intl.NumberFormat('us').format(number).toString();

function Blocks() {
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);

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
            } else {
              setProjects(
                projects.map((proj, i) =>
                  i === activeProject
                    ? Object.assign({}, proj, { blocks: null })
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
            newlayout: projects[activeProject].blocks.layout,
            newlabels: projects[activeProject].blocks?.labels,
            projectid: projects[activeProject].id,
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
          className='flex !size-full max-h-[300px] flex-col items-center justify-center bg-transparent'
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
          value={projects[activeProject].blocks.layout}
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
            {projects[activeProject].blocks.layout.map((block) => (
              <IndividualBlock key={block.uniquekey} {...block} />
            ))}
          </div>
        </Sortable>
      )}
    </div>
  );
}

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
          className={`flex w-full min-w-[900px] flex-col rounded-[12px] border-none bg-accent ${props.type === BlockType.Group ? 'min-w-[1000px] !bg-accent/50' : ''} ${props.type === BlockType.Nested ? 'rounded[10px] min-w-[280px]' : ''}`}
          style={cardStyle(props.color)}
        >
          <BlockContent {...props} />
        </Card>
      </div>
    </SortableItem>
  );
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'blue',
  },
} satisfies ChartConfig;

const pieChartConfig = {
  visitors: {
    label: 'Visitors',
  },
  chrome: {
    label: 'Chrome',
    color: 'blue',
  },
  safari: {
    label: 'Safari',
    color: 'lightblue',
  },
  firefox: {
    label: 'Firefox',
    color: 'purple',
  },
  edge: {
    label: 'Edge',
    color: 'violet',
  },
  other: {
    label: 'Other',
    color: 'pink',
  },
} satisfies ChartConfig;

function BlockContent(props: Block & { groupkey?: string }) {
  const [isHoveredMore, setIsHoveredMore] = useState(false);
  const [isHoveredDrag, setIsHoveredDrag] = useState(false);
  const [isOpen, setIsOpen] = useState(isHoveredMore);
  const { projects, activeProject } = useContext(ProjectsContext);
  const [chartData, setChartData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [rangeSummary, setRangeSummary] = useState<{
    pos: number;
    neg: number;
    average: number;
  }>({ pos: 0, neg: 0, average: 0 });
  const [range, setRange] = useState(7);

  // Get metrics for this block
  const metrics = useMemo(() => {
    return props.metricIds
      .map((id) => projects[activeProject].metrics?.find((m) => m.id === id))
      .filter((m) => m !== undefined) as Metric[];
  }, [props.metricIds, projects, activeProject]);

  useEffect(() => {
    console.log(props);
    const loadData = async () => {
      if (metrics.length === 0) return;

      const date = new Date();
      date.setDate(date.getDate() - (range - 1));

      // Create array of promises for all metrics
      const dataPromises = metrics.map((metric) =>
        fetchChartData(
          date,
          range,
          metric,
          projects[activeProject].id,
          'trend',
        ).then((data) => {
          // Process dual metric types
          if (metric.type === MetricType.Dual) {
            data.forEach((item) => {
              item[metric.name] = item[metric.namepos] - item[metric.nameneg];
            });
          }
          return {
            metric,
            data,
          };
        }),
      );

      // Wait for all data to be fetched and processed
      const results = await Promise.all(dataPromises);

      // Combine the results
      let combinedData: any[] = [];
      results.forEach(({ metric, data }, index) => {
        if (index === 0) {
          combinedData = data;
        } else {
          data.forEach((item, i) => {
            combinedData[i][metric.name] = item[metric.name];
          });
        }
      });

      setChartData(combinedData);
      setLoading(false);
    };

    loadData();
  }, [metrics, range]);

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
            {props.chartType !== ChartType.Pie &&
            props.chartType !== ChartType.Radar &&
            props.chartType !== ChartType.BarList ? (
              <div className='flex h-full'>
                {metrics.map((metric, i) => {
                  return (
                    <div
                      key={i}
                      className='group relative flex h-full select-none flex-col items-start justify-center gap-0.5 border-l px-5 font-mono text-2xl font-bold'
                      style={{ borderColor: `${props.color}33` }}
                    >
                      <div className='absolute left-0 top-0 size-full bg-current opacity-0 group-hover:opacity-10' />
                      <div className='font-sans text-xs font-normal'>
                        {metric.name}
                      </div>
                      {valueFormatter(21000)}
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
          <CardTitle>{props.name}</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
      ) : undefined}

      {props.nested !== undefined && props.nested !== null && (
        <NestedBlocks {...props} />
      )}

      {props.type !== BlockType.Group && (
        <CardContent
          className={`h-[30vh] min-h-[240px] ${props.chartType !== ChartType.BarList ? 'flex items-center justify-center' : ''} ${props.type === BlockType.Nested ? 'mt-5 h-[35vh]' : ''}`}
        >
          <Charts
            chartType={props.chartType}
            data={chartData}
            categories={metrics.map((metric) => metric.name)}
          />
        </CardContent>
      )}

      {props.type === BlockType.Group ? (
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
            Trending up by 5.2% this week <TrendingUp className='h-4 w-4' />
          </div>
          <div className='leading-none text-muted-foreground'>
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      )}
    </>
  );
}

function Charts(props: {
  chartType: ChartType | undefined;
  data: any[] | null;
  categories: string[];
}) {
  const chartProps = {
    className: 'h-full',
    valueFormatter,
  };

  switch (props.chartType) {
    case ChartType.Area:
      return (
        <AreaChart
          data={props.data ?? []}
          {...chartProps}
          colors={['violet', 'blue']}
          index='date'
          categories={props.categories}
          yAxisLabel='Total'
        />
      );
    case ChartType.Bar:
      return (
        <BarChart
          data={props.data ?? []}
          {...chartProps}
          colors={['violet', 'blue']}
          index='date'
          categories={props.categories}
          yAxisLabel='Total'
        />
      );
    case ChartType.Combo:
      return (
        <ComboChart
          data={ComboChartData}
          {...chartProps}
          index='date'
          enableBiaxial
          barSeries={{
            categories: ['SolarPanels'],
            showYAxis: true,
          }}
          lineSeries={{
            categories: ['Inverters'],
            showYAxis: true,
            colors: ['fuchsia'],
          }}
        />
      );
    case ChartType.BarList:
      return <BarList data={BarListData} {...chartProps} />;
    case ChartType.Pie:
      return (
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
              data={PieChartData}
              dataKey='visitors'
              nameKey='browser'
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
                          className='fill-foreground text-3xl font-bold'
                        >
                          {0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      );
    case ChartType.Radar:
      return (
        <ChartContainer config={chartConfig} className='mx-auto h-full w-full'>
          <RadarChart data={RadarChartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid className='fill-[blue] opacity-20' gridType='polygon' />
            <PolarAngleAxis dataKey='month' />
            <Radar
              dataKey='desktop'
              fill='var(--color-desktop)'
              fillOpacity={0.5}
            />
          </RadarChart>
        </ChartContainer>
      );
    default:
      return <div>No chart available for this type.</div>;
  }
}

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
                      l.uniquekey === props.uniquekey
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
            key={block.uniquekey}
            groupkey={props.uniquekey}
            {...block}
          />
        ))}
        {(props.nested ? props.nested.length : 0) < 3 ? (
          <BlocksDialog type='compact' groupkey={props.uniquekey}>
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
