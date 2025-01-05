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
import { Sortable, SortableItem } from '@/components/ui/sortable';
import { Plus, Rocket, Sparkle, X } from 'lucide-react';
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
import { FancyBox } from '@/components/ui/fancy-box';

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
        className='p-5'
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
          <Card className='mt-5 rounded-3xl rounded-b-none border-none bg-black'>
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
    <div className='mt-0 flex w-full items-center justify-between rounded-[12px] rounded-t-none border-t bg-accent p-5 py-2'>
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

const dataConfig = {
  speicalTricks: [
    {
      id: 1,
      name: 'Indy Backflip',
      colSpan: 2,
    },
    {
      id: 2,
      name: 'Pizza Guy',
      colSpan: 1,
    },
    {
      id: 3,
      name: '360 Varial McTwist',
      colSpan: 1,
    },
    {
      id: 4,
      name: 'Kickflip Backflip',
      colSpan: 2,
    },
  ],
};
function Blocks() {
  const [specialTricks, setSpecialTricks] = useState(dataConfig.speicalTricks);
  return (
    <div className='mt-5 pb-20'>
      <Sortable
        orientation='mixed'
        collisionDetection={closestCorners}
        value={specialTricks}
        onValueChange={setSpecialTricks}
        overlay={<div className='size-full rounded-[12px] bg-primary/10' />}
      >
        <div className='grid grid-cols-2 gap-4'>
          {specialTricks.map((item) => (
            <SortableItem key={item.id} value={item.id} asTrigger asChild>
              <Card
                className='flex h-[40vh] w-full items-center justify-center rounded-[12px] bg-accent hover:bg-accent/80'
                style={
                  item.colSpan === 2
                    ? { gridColumn: 'span 2 / span 2' }
                    : { gridColumn: 'span 1 / span 1' }
                }
              >
                <CardHeader className='items-center'>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
              </Card>
            </SortableItem>
          ))}
        </div>
      </Sortable>
    </div>
  );
}

function BlocksDialog(props: { children: ReactNode }) {
  const [value, setValue] = useState<number>(0);

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
                colors: ['amber'],
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
          name: 'Pie Chart View',
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

  return (
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
          <BlocksDialogStack>
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

function BlocksDialogStack(props: { children: ReactNode }) {
  const [inputValue, setInputValue] = useState<any>('');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DialogStack>
      <DialogStackTrigger asChild>{props.children}</DialogStackTrigger>
      <DialogStackOverlay className='rounded-2xl bg-black/20 ring ring-purple-500/70' />
      <DialogStackBody className='h-full'>
        <DialogStackContent>
          <DialogHeader>
            <DialogStackTitle>Choose block name</DialogStackTitle>
            <DialogStackDescription>
              The block name will be used to identify the data visualization and
              help you organize your metrics.
            </DialogStackDescription>
          </DialogHeader>
          <div className='my-4'>
            <div className='flex flex-col gap-2'>
              <Label>Block name</Label>
              <Input
                ref={inputRef}
                placeholder='Name...'
                value={inputValue}
                onChange={(e) => setInputValue(e.target)}
              />
            </div>
          </div>
          <DialogStackFooter>
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
            <DialogStackTitle>Select metrics</DialogStackTitle>
            <DialogStackDescription>
              You can select multiple metrics or a single one, to compare or
              track various data points.
            </DialogStackDescription>
          </DialogHeader>
          <div className='my-4 mb-0'>
            <div className='flex flex-col gap-2'>
              <Label>Select metrics</Label>
              <FancyBox />
            </div>
          </div>
          <DialogStackFooter>
            <DialogStackPrevious asChild>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Previous
              </Button>
            </DialogStackPrevious>
            <DialogStackNext asChild>
              <Button className='rounded-[12px]'>Create block</Button>
            </DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>
      </DialogStackBody>
    </DialogStack>
  );
}
