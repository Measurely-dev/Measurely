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
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '@/components/ui/sortable';
import {
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
  AreaChartData,
  BarChartData,
  BarListData,
  ComboChartData,
  PieChartData,
  RadarChartData,
} from '@/components/global/block-fake-data';
import { ComboChart } from '@/components/ui/combo-chart';
import { BarChart } from '@/components/ui/bar-chart';
import { BarList } from '@/components/ui/bar-list';
import {
  DialogStack,
  DialogStackBody,
  DialogStackClose,
  DialogStackContent,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTitle,
  DialogStackTrigger,
} from '@/components/ui/dialog-stack';
import { Input } from '@/components/ui/input';
import { MetricSelect } from '@/components/ui/metric-select';
import { LabelSelect } from '@/components/ui/label-select';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Label,
} from 'recharts';
import { Separator } from '@/components/ui/separator';

export default function DashboardHomePage() {
  const { projects, activeProject } = useContext(ProjectsContext);
  const [activeMetric, setActiveMetric] = useState(0);

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

  useEffect(() => {
    const new_index =
      projects[activeProject].metrics === null
        ? 0
        : projects[activeProject].metrics.length === 0
          ? 0
          : projects[activeProject].metrics.length - 1;

    if (activeMetric > new_index) {
      setActiveMetric(new_index);
    }
  }, [activeProject]);
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
        <div className='flex gap-2'>
          <Button variant={'secondary'} className='rounded-[12px]'>
            <Group className='mr-2 size-4' />
            Add group
          </Button>
          <BlocksDialog type='wide'>
            <Button className='rounded-[12px]'>
              <PackagePlus className='mr-2 size-4' />
              Create block
            </Button>
          </BlocksDialog>
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
type ChartTypes =
  | 'bar-chart'
  | 'area-chart'
  | 'bar-list'
  | 'combo-chart'
  | 'pie-chart'
  | 'radar-chart';

interface ChartBlock {
  id: number;
  name: string;
  colSpan: number;
  type: ChartTypes;
  blockType: 'group' | 'default' | 'nested';
  label: string;
  color: string;
}

interface GroupBlock {
  id: number;
  name: string;
  colSpan: number;
  type: ChartBlock[];
  blockType: 'group' | 'default' | 'nested';
  label: 'group';
  color: string;
}

type BlockProps = ChartBlock | GroupBlock;

const dataConfig: { blocks: BlockProps[] } = {
  blocks: [
    {
      id: 1,
      colSpan: 3,
      name: 'Analytics group',
      type: [
        {
          id: 6,
          name: 'Nested block 1',
          colSpan: 1,
          type: 'radar-chart',
          label: 'compare',
          color: '#06b6d4',
          blockType: 'nested',
        },
        {
          id: 7,
          name: 'Nested block 2',
          colSpan: 1,
          type: 'pie-chart',
          label: 'fast growing',
          color: '#E91E63',
          blockType: 'nested',
        },
      ],
      label: 'group',
      color: '#000',
      blockType: 'group',
    },
    {
      id: 2,
      name: 'Amount of solar tech',
      colSpan: 3,
      type: 'area-chart',
      label: 'compare',
      color: '#8b5cf6',
      blockType: 'default',
    },
    {
      id: 3,
      name: 'Population index',
      colSpan: 3,
      type: 'bar-chart',
      label: 'overview',
      color: '#E91E63',
      blockType: 'default',
    },
    {
      id: 4,
      name: 'Most viewed pages',
      colSpan: 3,
      type: 'bar-list',
      label: 'profit',
      color: '#3b82f6',
      blockType: 'default',
    },
    {
      id: 5,
      name: 'Pigeon population',
      colSpan: 3,
      type: 'combo-chart',
      label: 'fast growing',
      color: '#06b6d4',
      blockType: 'default',
    },
  ],
};

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
  const [blockData, setBlockData] = useState<BlockProps[]>(dataConfig.blocks);

  return (
    <div className='mt-5 pb-20'>
      <Sortable
        orientation='vertical'
        value={blockData}
        strategy={rectSortingStrategy}
        onValueChange={setBlockData}
        overlay={<div className='size-full rounded-[12px] bg-primary/5' />}
      >
        <div className='grid grid-cols-3 gap-4'>
          {blockData.map((block) => (
            <Block key={block.id} {...block} />
          ))}
        </div>
      </Sortable>
    </div>
  );
}

function Block(props: BlockProps) {
  return (
    <SortableItem key={props.id} value={props.id} asChild>
      <Card
        className={`flex w-full flex-col rounded-[12px] border-none bg-accent ${props.blockType === 'group' ? '!bg-accent/50' : ''} ${props.blockType === 'nested' ? 'rounded[10px]' : ''}`}
        style={{
          ...cardStyle(props.color),
          gridColumn:
            props.colSpan === 2
              ? 'span 2 / span 2'
              : props.colSpan === 3
                ? 'span 3 / span 3'
                : 'span 1 / span 1',
        }}
      >
        <BlockContent {...props} />
      </Card>
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

function BlockContent(props: BlockProps) {
  const [isHoveredMore, setIsHoveredMore] = useState(false);
  const [isHoveredDrag, setIsHoveredDrag] = useState(false);
  const [isOpen, setIsOpen] = useState(isHoveredMore);
  const [nestedBlocks, setNestedBlocks] = useState<ChartBlock[]>(
    Array.isArray(props.type) ? props.type : [],
  );
  const totalVisitors = useMemo(() => {
    return PieChartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);
  const Charts = () => {
    const chartProps = {
      className: 'h-full',
      valueFormatter,
    };

    switch (props.type) {
      case 'area-chart':
        return (
          <AreaChart
            data={AreaChartData}
            {...chartProps}
            colors={['violet', 'blue']}
            index='date'
            categories={['SolarPanels', 'Inverters']}
            yAxisLabel='Total'
          />
        );
      case 'bar-chart':
        return (
          <BarChart
            data={BarChartData}
            {...chartProps}
            colors={['violet', 'blue']}
            index='date'
            categories={['SolarPanels', 'Inverters']}
            yAxisLabel='Total'
          />
        );
      case 'combo-chart':
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
      case 'bar-list':
        return <BarList data={BarListData} {...chartProps} />;
      case 'pie-chart':
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
                <Label
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
                            {totalVisitors.toLocaleString()}
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
      case 'radar-chart':
        return (
          <ChartContainer
            config={chartConfig}
            className='mx-auto h-full w-full'
          >
            <RadarChart data={RadarChartData}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarGrid
                className='fill-[blue] opacity-20'
                gridType='polygon'
              />
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
  };

  const renderNestedBlocks = () => {
    if (Array.isArray(props.type)) {
      return (
        <Sortable
          orientation='horizontal'
          value={nestedBlocks}
          strategy={rectSortingStrategy}
          onValueChange={setNestedBlocks}
          overlay={<div className='size-full rounded-[12px] bg-primary/5' />}
        >
          <div className='grid grid-cols-3 gap-4 p-3'>
            {nestedBlocks.map((nestedBlock) => (
              <Block key={nestedBlock.id} {...nestedBlock} />
            ))}
            {nestedBlocks.length < 3 ? (
              <BlocksDialog type='compact'>
                <div className='h-full cursor-pointer select-none'>
                  <EmptyState
                    title='Add new block'
                    description='Add a new block to this group.'
                    icons={[PlusCircle, Plus, PlusSquare]}
                    className='flex !size-full max-h-none flex-col items-center justify-center bg-transparent'
                  />
                </div>
              </BlocksDialog>
            ) : undefined}
          </div>
        </Sortable>
      );
    }

    return (
      <CardContent
        className={`min-h-[240px] ${props.type !== 'bar-list' ? 'flex h-[30vh] items-center justify-center' : ''} ${props.blockType === 'nested' ? 'mt-5 h-[35vh]' : ''}`}
      >
        {Charts()}
      </CardContent>
    );
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
          {props.blockType === 'group' ? (
            <div className='flex flex-row items-center gap-4 text-sm font-medium capitalize'>
              <Separator orientation='vertical' className='ml-2 h-4' />{' '}
              {props.name}
            </div>
          ) : (
            <></>
          )}
          <BlockOptions
            setIsOpen={setIsOpen}
            type={props.blockType === 'group' ? 'group' : 'block'}
          >
            <Button
              size={'icon'}
              variant={'ghost'}
              style={buttonStyle(props.color, isHoveredMore, isOpen)}
              onMouseEnter={() => setIsHoveredMore(true)}
              onMouseLeave={() => setIsHoveredMore(false)}
              className='ml-auto rounded-[12px]'
            >
              <MoreVertical className='size-5 p-0' />
            </Button>
          </BlockOptions>
        </div>
      </CardHeader>
      {props.blockType === 'group' || props.blockType === 'nested' ? (
        <></>
      ) : (
        <>
          <div
            className='mb-5 flex h-[90px] w-full flex-row items-center justify-between gap-5 border-b pl-6'
            style={{ borderColor: `${props.color}33` }}
          >
            <div className='flex flex-row items-center gap-4'>
              <CardTitle className='!m-0 !p-0 text-xl'>{props.name}</CardTitle>
              <Select defaultValue='7'>
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
            {props.type !== 'pie-chart' &&
            props.type !== 'radar-chart' &&
            props.type !== 'bar-list' ? (
              <div className='flex h-full'>
                {[
                  { name: 'SolarPanels', value: 21267 },
                  { name: 'Inverters', value: 56023 },
                ].map((item, i) => {
                  return (
                    <div
                      key={i}
                      className='group relative flex h-full select-none flex-col items-start justify-center gap-0.5 border-l px-5 font-mono text-2xl font-bold'
                      style={{ borderColor: `${props.color}33` }}
                    >
                      <div className='absolute left-0 top-0 size-full bg-current opacity-0 group-hover:opacity-10' />
                      <div className='font-sans text-xs font-normal'>
                        {item.name}
                      </div>
                      {valueFormatter(item.value)}
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

      {props.blockType === 'nested' ? (
        <CardHeader className='items-center pb-0'>
          <CardTitle>Pie Chart - Donut with Text</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
      ) : undefined}
      {renderNestedBlocks()}
      {props.blockType === 'group' ? (
        <></>
      ) : (
        <CardFooter
          className={`flex-col gap-2 text-sm ${props.blockType === 'nested' ? 'items-center' : 'items-start'}`}
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

function BlockOptions(props: {
  children: ReactNode;
  setIsOpen: (state: boolean) => void;
  type: 'group' | 'block';
}) {
  return (
    <DropdownMenu onOpenChange={(e) => props.setIsOpen(e)}>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent className='mr-8 w-56 rounded-[12px] shadow-md'>
        {props.type === 'group' ? (
          <DropdownMenuLabel>Group Options</DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel>Block Options</DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem className={props.type === 'group' ? 'hidden' : ''}>
            Edit Label
          </DropdownMenuItem>
          <DropdownMenuItem className={props.type === 'group' ? 'hidden' : ''}>
            Edit Metric(s)
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator
          className={props.type === 'group' ? 'hidden' : ''}
        />
        <DropdownMenuGroup className={props.type === 'group' ? 'hidden' : ''}>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='hover:!text-destructive'>
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
// -----------------------------------------------------------------------------------------------------------
interface BlockShowcaseType {
  name: string;
  value: number;
  description: string;
  chart: ReactNode;
}

// DIALOG BLOCK
const blockWideType: BlockShowcaseType[] = [
  {
    name: 'Area Chart',
    value: 1,
    description:
      'Visualizes data trends over time with shaded areas, highlighting volume or changes.',
    chart: (
      <AreaChart
        className='h-40'
        data={AreaChartData}
        colors={['violet', 'blue']}
        index='date'
        categories={['SolarPanels', 'Inverters']}
        valueFormatter={(number: number) =>
          `$${Intl.NumberFormat('us').format(number).toString()}`
        }
        showYAxis={false}
      />
    ),
  },
  {
    name: 'Bar Chart',
    value: 2,
    description:
      'Represents data in a horizontal bar format, best for ranking and side-by-side comparisons.',
    chart: (
      <BarChart
        className='h-40'
        data={BarChartData}
        colors={['violet', 'blue']}
        index='date'
        categories={['SolarPanels', 'Inverters']}
        valueFormatter={(number: number) =>
          `$${Intl.NumberFormat('us').format(number).toString()}`
        }
        showYAxis={false}
      />
    ),
  },
  {
    name: 'Combo Chart',
    value: 3,
    description:
      'Combines a bar chart and line chart in one, great for comparing totals and trends simultaneously.',
    chart: (
      <ComboChart
        className='h-40'
        data={ComboChartData}
        index='date'
        enableBiaxial={true}
        barSeries={{
          categories: ['SolarPanels'],
          showYAxis: false,
        }}
        lineSeries={{
          categories: ['Inverters'],
          showYAxis: false,
          colors: ['fuchsia'],
        }}
      />
    ),
  },
  {
    name: 'Bar List',
    value: 4,
    description:
      'Displays data in a vertical bar chart format, ideal for comparing multiple categories.',
    chart: <BarList data={BarListData} />,
  },
];

// Optionally define the same type for blockCompactTypes if needed
const blockCompactType: BlockShowcaseType[] = [
  {
    name: 'Pie Chart',
    value: 5,
    description:
      'Shows proportions of a whole using a pie chart, perfect for visualizing percentages or ratios.',
    chart: (
      <ChartContainer
        config={pieChartConfig}
        className='mx-auto h-[250px] w-full'
      >
        <PieChart>
          <Pie
            data={PieChartData}
            dataKey='visitors'
            nameKey='browser'
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
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
                        1000
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
    ),
  },
  {
    name: 'Radar Chart',
    value: 6,
    description:
      'Shows data distribution across multiple axes, perfect for comparing categories or metrics in a visually intuitive and informative way.',
    chart: (
      <ChartContainer config={chartConfig} className='mx-auto h-[250px] w-full'>
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
    ),
  },
];

function BlocksDialog(props: {
  children: ReactNode;
  type: 'compact' | 'wide';
}) {
  const [value, setValue] = useState<number>(0);
  return (
    <DialogStack>
      <Dialog>
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent className='flex h-[80vh] max-h-[650px] w-[95%] max-w-[700px] flex-col gap-0 p-0 max-sm:w-[100%]'>
          <DialogHeader className='px-5 py-5 max-sm:text-start'>
            <DialogTitle>Select Block</DialogTitle>
            <DialogDescription>
              Custom components to showcase or compare metric data on your
              overview page.
            </DialogDescription>
          </DialogHeader>
          <div className='flex h-full flex-col gap-5 overflow-y-auto border-t px-5 pb-5 pt-3'>
            {props.type === 'wide' ? (
              <div className='grid grid-cols-1 gap-5'>
                {blockWideType.map((block, i) => (
                  <BlockItem
                    key={i}
                    description={block.description}
                    name={block.name}
                    value={block.value}
                    state={value}
                    setState={setValue}
                    chart={block.chart}
                  />
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-5'>
                {blockCompactType.map((block, i) => (
                  <BlockItem
                    key={i}
                    description={block.description}
                    name={block.name}
                    value={block.value}
                    state={value}
                    setState={setValue}
                    chart={block.chart}
                  />
                ))}
              </div>
            )}
          </div>
          <DialogFooter className='border-t p-5'>
            <DialogClose asChild onClick={() => setValue(0)}>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Cancel
              </Button>
            </DialogClose>
            <BlocksDialogStack value={value}>
              <Button
                className='rounded-[12px] max-md:mb-2 max-md:w-full'
                disabled={value === 0 ? true : false}
              >
                Next
              </Button>
            </BlocksDialogStack>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogStack>
  );
}

function BlockItem(props: {
  name: string;
  value: number;
  description: string;
  chart?: ReactNode;
  state: any;
  setState: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div
      className={`flex w-full select-none flex-col gap-1 rounded-xl border p-3 transition-all duration-150 ${
        props.state === props.value
          ? 'cursor-pointer bg-purple-500/5 ring-2 ring-purple-500'
          : 'cursor-pointer hover:bg-accent/50'
      }`}
      onClick={() => {
        props.setState(props.state !== props.value ? props.value : 0);
      }}
    >
      <div className='text-sm font-medium'>{props.name}</div>
      <div className='text-xs font-light text-secondary'>
        {props.description}
      </div>
      {props.value === 4 ? (
        <BarList className='mt-4' data={BarListData} />
      ) : (
        <div className='pointer-events-none mx-auto mt-4 flex w-full select-none items-center justify-center'>
          {props.chart}
        </div>
      )}
    </div>
  );
}
const findBlockByValue = (value: number) => {
  for (const block of blockWideType) {
    if (block.value === value) {
      return block;
    }
  }

  for (const block of blockCompactType) {
    if (block.value === value) {
      return block;
    }
  }

  return null;
};

function BlocksDialogStack(props: { children: ReactNode; value: number }) {
  const blockSelected = findBlockByValue(props.value);
  const [isLabelSelected, setIsLabelSelected] = useState<boolean>(false);
  const [isMetricSelected, setIsMetricSelected] = useState<boolean>(false);
  const [nameInputValue, setNameInputValue] = useState<string>('');
  return (
    <>
      <DialogStackOverlay className='-left-2 top-0 z-50 rounded-2xl bg-black/20 ring ring-purple-500/70' />
      <DialogStackTrigger asChild>{props.children}</DialogStackTrigger>
      <DialogStackBody className='h-full'>
        <DialogStackContent>
          <DialogHeader>
            <DialogStackTitle>
              Choose{' '}
              <span className='text-purple-500'>{blockSelected?.name}</span>{' '}
              Name
            </DialogStackTitle>
            <DialogStackDescription>
              Choose a descriptive and concise name that reflects the data the
              block will display.
            </DialogStackDescription>
          </DialogHeader>
          <div className='my-4 mb-0 flex flex-col gap-2'>
            <Popover open={true}>
              <PopoverContent asChild>
                <div className='hidden' />
              </PopoverContent>
            </Popover>
            <Label>Choose block name</Label>
            <Input
              placeholder='Block name...'
              className='z-50 h-11 rounded-[12px]'
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              maxLength={25}
            />
          </div>
          <DialogStackFooter className='mt-5'>
            <DialogStackClose asChild>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Cancel
              </Button>
            </DialogStackClose>
            <DialogStackNext asChild>
              <Button
                className='rounded-[12px]'
                disabled={nameInputValue ? false : true}
              >
                Next
              </Button>
            </DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>

        <DialogStackContent>
          <DialogHeader>
            <DialogStackTitle>Select block label</DialogStackTitle>
            <DialogStackDescription>
              The block label will be used to identify the data visualization
              and help you organize your metrics.
            </DialogStackDescription>
          </DialogHeader>
          <div className='my-4 mb-0'>
            <div className='flex flex-col gap-2'>
              <Label>Block label</Label>
              <LabelSelect setIsSelected={setIsLabelSelected} />
            </div>
          </div>
          <DialogStackFooter>
            <DialogStackPrevious asChild>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Previous
              </Button>
            </DialogStackPrevious>
            <DialogStackNext asChild>
              <Button className='rounded-[12px]' disabled={!isLabelSelected}>
                Next
              </Button>
            </DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>

        <DialogStackContent>
          <DialogHeader>
            <DialogStackTitle>Select metrics</DialogStackTitle>
            <DialogStackDescription>
              You can select multiple metrics or a single one, to compare or
              track various data points.
            </DialogStackDescription>
          </DialogHeader>
          <div className='my-4 mb-0'>
            <div className='flex flex-col gap-2'>
              <Label>Select metrics</Label>
              <MetricSelect setIsSelected={setIsMetricSelected} />
            </div>
          </div>
          <DialogStackFooter>
            <DialogStackPrevious asChild>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Previous
              </Button>
            </DialogStackPrevious>
            <DialogStackNext asChild>
              <Button className='rounded-[12px]' disabled={!isMetricSelected}>
                Create block
              </Button>
            </DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>
      </DialogStackBody>
    </>
  );
}
