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
  useRef,
  useState,
} from 'react';
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '@/components/ui/sortable';
import {
  GripVertical,
  MoreVertical,
  Plus,
  Rocket,
  Sparkle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContext } from 'react';
import { ProjectsContext, UserContext } from '@/dash-context';
import PlansDialog from '@/components/dashboard/plans-dialog';
import MetricStats from '@/components/dashboard/metric-stats';
import { MetricType } from '@/types';
import { closestCorners } from '@dnd-kit/core';
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
  DonutChartData,
} from '@/components/global/block-fake-data';
import { DonutChart } from '@/components/ui/donut-chart';
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
import { Label } from '@/components/ui/label';
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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
      <MetricStats
        className='rounded-b-[12px] p-5'
        stats={[
          {
            title: 'Metric used',
            description: 'Across this project',
            value: projects[activeProject].metrics?.length,
          },
          {
            title: 'Number of dual metric',
            description: 'Across this project',
            value: projects[activeProject].metrics?.filter(
              (m) => m.type === MetricType.Dual,
            ).length,
          },
          {
            title: 'Number of basic metric',
            description: 'Across this project',
            value: projects[activeProject].metrics?.filter(
              (m) => m.type === MetricType.Base,
            ).length,
          },
          {
            title: 'Team members',
            description: 'Coming soon',
            value: 'N/A',
          },
        ]}
      />
      <Toolbar />
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
          <Card className='mt-5 rounded-[12px] rounded-b-none border-none bg-black'>
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

function Toolbar() {
  return (
    <div className='mt-5 flex w-full items-center justify-between rounded-[12px] bg-accent p-5 py-2'>
      <div className='font-medium'>Blocks</div>
      <div className='flex items-center gap-2'>
        <BlocksDialog>
          <Button className='rounded-[12px]'>
            <Plus className='mr-2 size-4' />
            Create new block
          </Button>
        </BlocksDialog>
      </div>
    </div>
  );
}
type ChartTypes =
  | 'bar-chart'
  | 'area-chart'
  | 'bar-list'
  | 'combo-chart'
  | 'donut-chart'
  | 'pie-chart';

interface BlockProps {
  id: number;
  name: string;
  colSpan: number;
  type: ChartTypes;
  label: string;
  color: string;
}
const dataConfig: { blocks: BlockProps[] } = {
  blocks: [
    {
      id: 1,
      name: 'Amount of solar tech',
      colSpan: 2,
      type: 'area-chart',
      label: 'compare',
      color: '#8b5cf6',
    },
    {
      id: 2,
      name: 'Population index',
      colSpan: 2,
      type: 'bar-chart',
      label: 'overview',
      color: '#E91E63',
    },
    {
      id: 3,
      name: 'Most viewed pages',
      colSpan: 2,
      type: 'bar-list',
      label: 'profit',
      color: '#3b82f6',
    },
    {
      id: 4,
      name: 'Pigeon population',
      colSpan: 2,
      type: 'combo-chart',
      label: 'fast growing',
      color: '#06b6d4',
    },
    {
      id: 5,
      name: 'Money spent',
      colSpan: 1,
      type: 'donut-chart',
      label: 'startup',
      color: '#eab308',
    },
    {
      id: 6,
      name: 'Money saved',
      colSpan: 1,
      type: 'pie-chart',
      label: 'insight',
      color: '#eab308',
    },
  ],
};

const cardStyle = (color: string) => ({
  borderColor: `${color}26`,
  backgroundColor: `${color}0D`,
  color,
});

const buttonStyle = (color: string, isHovered: boolean, isOpen?: boolean) => ({
  borderColor: isHovered || isOpen ? `${color}80` : `${color}26`,
  backgroundColor: isHovered || isOpen ? `${color}0D` : `${color}00`,
  color,
  transition: 'background-color 0.3s, border-color 0.3s',
});

const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};

function Blocks() {
  const [blockData, setBlockData] = useState<BlockProps[]>(dataConfig.blocks);

  return (
    <div className='mt-5 pb-20'>
      <Sortable
        orientation='mixed'
        collisionDetection={closestCorners}
        value={blockData}
        onValueChange={setBlockData}
        overlay={<div className='size-full rounded-[12px] bg-primary/10' />}
      >
        <div className='grid grid-cols-2 gap-4'>
          {blockData.map((item) => (
            <Block
              id={item.id}
              colSpan={item.colSpan}
              name={item.name}
              type={item.type}
              color={item.color}
              label={item.label}
            />
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
        className='flex w-full flex-col rounded-[12px] bg-accent hover:bg-accent/80'
        style={{
          ...cardStyle(props.color),
          gridColumn:
            props.colSpan === 2 ? 'span 2 / span 2' : 'span 1 / span 1',
        }}
      >
        <BlockContent
          chartType={props.type}
          name={props.name}
          color={props.color}
          label={props.label}
        />
      </Card>
    </SortableItem>
  );
}
function BlockContent(props: {
  chartType: ChartTypes;
  name: string;
  color: string;
  label: string;
}) {
  const [isHoveredMore, setIsHoveredMore] = useState(false);
  const [isHoveredDrag, setIsHoveredDrag] = useState(false);
  const [isOpen, setIsOpen] = useState(isHoveredMore);
  const Charts = () => {
    switch (props.chartType) {
      case 'area-chart':
        return (
          <AreaChart
            data={AreaChartData}
            className='h-full'
            colors={['violet', 'blue']}
            index='date'
            categories={['SolarPanels', 'Inverters']}
            valueFormatter={(number: number) =>
              `$${Intl.NumberFormat('us').format(number).toString()}`
            }
            yAxisLabel='Total'
          />
        );
      case 'bar-chart':
        return (
          <BarChart
            data={BarChartData}
            className='h-full'
            colors={['violet', 'blue']}
            index='date'
            categories={['SolarPanels', 'Inverters']}
            valueFormatter={(number: number) =>
              `$${Intl.NumberFormat('us').format(number).toString()}`
            }
            yAxisLabel='Total'
          />
        );
      case 'combo-chart':
        return (
          <ComboChart
            data={ComboChartData}
            className='h-full'
            index='date'
            enableBiaxial={true}
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
        return <BarList data={BarListData} className='h-full' />;
      case 'donut-chart':
        return (
          <DonutChart
            data={DonutChartData}
            className='h-full'
            category='name'
            value='amount'
            valueFormatter={(number: number) =>
              `$${Intl.NumberFormat('us').format(number).toString()}`
            }
          />
        );
      case 'pie-chart':
        return (
          <DonutChart
            data={DonutChartData}
            className='h-full'
            category='name'
            value='amount'
            variant='pie'
            valueFormatter={(number: number) =>
              `$${Intl.NumberFormat('us').format(number).toString()}`
            }
          />
        );
    }
  };
  return (
    <>
      <CardHeader className='px-3 py-2'>
        <div className='flex w-full items-center gap-2 p-0'>
          <SortableDragHandle
            variant={'ghost'}
            size={'icon'}
            className='roudned-[12px]'
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
          <BlockOptions setIsOpen={setIsOpen}>
            <Button
              size={'icon'}
              variant={'ghost'}
              style={buttonStyle(props.color, isHoveredMore, isOpen)}
              onMouseEnter={() => setIsHoveredMore(true)}
              onMouseLeave={() => setIsHoveredMore(false)}
              className='roudned-[12px] ml-auto'
            >
              <MoreVertical className='size-5 p-0' />
            </Button>
          </BlockOptions>
        </div>
      </CardHeader>
      <div
        className='mb-5 flex h-[90px] w-full flex-row items-center justify-between gap-5 border-y pl-6'
        style={{ borderColor: `${props.color}33` }}
      >
        <CardTitle className='!m-0 !p-0 text-xl'>{props.name}</CardTitle>
        <div className='flex h-full'>
          {[
            { name: 'SolarPanels', value: 21267 },
            { name: 'Inverters', value: 21267 },
          ].map((item, i) => {
            return (
              <div
                key={i}
                className={`group flex-col gap-0.5 items-start relative flex h-full select-none justify-center border-l px-5 font-mono text-2xl font-bold`}
                style={{ borderColor: `${props.color}33` }}
              >
                <div className='absolute top-0 left-0 size-full bg-current opacity-0 group-hover:opacity-10' />
                <div className='text-xs font-normal font-sans'>
                  {item.name}
                </div>
                {valueFormatter(item.value)}
              </div>
            );
          })}
        </div>
      </div>
      <CardContent
        className={`h-[30vh] ${props.chartType === 'bar-list' ? 'h-fit' : 'flex items-center justify-center'} ${props.chartType === 'donut-chart' ? 'h-[30vh] w-full p-0' : props.chartType === 'pie-chart' ? 'h-[30vh] w-full p-0' : ''}`}
      >
        {Charts()}
      </CardContent>
    </>
  );
}
function BlockOptions(props: {
  children: ReactNode;
  setIsOpen: (state: boolean) => void;
}) {
  return (
    <DropdownMenu onOpenChange={(e) => props.setIsOpen(e)}>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent className='mr-8 w-56 rounded-[12px] shadow-md'>
        <DropdownMenuLabel>Block Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Edit Label</DropdownMenuItem>
          <DropdownMenuItem>Edit Metric(s)</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
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

// DIALOG BLOCK
const blockType = [
  {
    category: 'Wide Blocks',
    blocks: [
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
    ],
  },
  {
    category: 'Compact Blocks',
    blocks: [
      {
        name: 'Donut Chart',
        value: 6,
        description:
          'A variation of the pie chart with a central hole, useful for emphasizing data segments.',
        chart: (
          <DonutChart
            className='h-40'
            data={DonutChartData}
            category='name'
            value='amount'
            valueFormatter={(number: number) =>
              `$${Intl.NumberFormat('us').format(number).toString()}`
            }
          />
        ),
      },
      {
        name: 'Pie Chart',
        value: 5,
        description:
          'Shows proportions of a whole using a pie chart, perfect for visualizing percentages or ratios.',
        chart: (
          <DonutChart
            className='h-40'
            data={DonutChartData}
            category='name'
            value='amount'
            variant='pie'
            valueFormatter={(number: number) =>
              `$${Intl.NumberFormat('us').format(number).toString()}`
            }
          />
        ),
      },
    ],
  },
];

function BlocksDialog(props: { children: ReactNode }) {
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
          <div className='flex flex-col gap-5 overflow-y-auto border-t px-5 pb-5 pt-3'>
            {blockType.map((blockSection, i) => (
              <div key={i}>
                <div className='mb-2 mt-2 text-base font-medium capitalize text-primary'>
                  {blockSection.category}
                </div>
                <div
                  className={`grid grid-cols-1 gap-5 ${blockSection.category === 'Compact Blocks' ? 'grid-cols-2 max-sm:grid-cols-1' : 'grid-cols-1'}`}
                >
                  {blockSection.blocks.map((blockItem, j) => (
                    <BlockItem
                      key={j}
                      description={blockItem.description}
                      name={blockItem.name}
                      value={blockItem.value}
                      state={value}
                      setState={setValue}
                      chart={blockItem.chart}
                    />
                  ))}
                </div>
              </div>
            ))}
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
  for (const category of blockType) {
    const block = category.blocks.find((b) => b.value === value);
    if (block) return block;
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
              Create a new{' '}
              <span className='text-purple-500'>{blockSelected?.name}</span>{' '}
              block
            </DialogStackTitle>
            <DialogStackDescription>
              {blockSelected?.description}
            </DialogStackDescription>
          </DialogHeader>
          <DialogStackFooter className='mt-5'>
            <DialogStackClose asChild>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Cancel
              </Button>
            </DialogStackClose>
            <DialogStackNext asChild>
              <Button className='rounded-[12px]'>Next</Button>
            </DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>

        <DialogStackContent>
          <DialogHeader>
            <DialogStackTitle>Choose Block Name</DialogStackTitle>
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
            <DialogStackPrevious asChild>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Previous
              </Button>
            </DialogStackPrevious>
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
