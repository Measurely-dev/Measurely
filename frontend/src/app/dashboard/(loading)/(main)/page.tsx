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
  ChangeEvent,
  Dispatch,
  FC,
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
  BlocksIcon,
  CopyPlus,
  Cuboid,
  Edit,
  GripVertical,
  Group,
  MoreVertical,
  PackagePlus,
  Plus,
  PlusCircle,
  PlusSquare,
  Rocket,
  Sparkle,
  Trash2,
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
  SelectLabel,
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
import { Block, BlockType, ChartType, Metric } from '@/types';
import { toast } from 'sonner';
import { generateString } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirm } from '@omit/react-confirm-dialog';

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
                <DialogStackTitle>Choose group name</DialogStackTitle>
                <DialogStackDescription>
                  Choose a descriptive and concise name that reflects the data
                  the group will hold.
                </DialogStackDescription>
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

function IndividualBlock(props: Block) {
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

function BlockContent(props: Block) {
  const [isHoveredMore, setIsHoveredMore] = useState(false);
  const [isHoveredDrag, setIsHoveredDrag] = useState(false);
  const [isOpen, setIsOpen] = useState(isHoveredMore);
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
            {props.chartType !== ChartType.Pie &&
            props.chartType !== ChartType.Radar &&
            props.chartType !== ChartType.BarList ? (
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

      {props.type === BlockType.Nested ? (
        <CardHeader className='items-center pb-0'>
          <CardTitle>{props.name}</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
      ) : undefined}
      <NestedBlocks {...props} />
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

function Charts(props: { chartType: ChartType | undefined }) {
  const chartProps = {
    className: 'h-full',
    valueFormatter,
  };

  switch (props.chartType) {
    case ChartType.Area:
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
    case ChartType.Bar:
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
  const { projects, setProjects, activeProject } = useContext(ProjectsContext);
  if (props.nested !== undefined && props.nested !== null) {
    return (
      <Sortable
        orientation='horizontal'
        value={props.nested}
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
          {props.nested.map((block) => (
            <IndividualBlock key={block.uniquekey} {...block} />
          ))}
          {props.nested.length < 3 ? (
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

  return (
    <CardContent
      className={`h-[30vh] min-h-[240px] ${props.chartType !== ChartType.BarList ? 'flex items-center justify-center' : ''} ${props.type === BlockType.Nested ? 'mt-5 h-[35vh]' : ''}`}
    >
      <Charts chartType={props.chartType} />
    </CardContent>
  );
}

const RenameConfirmContent: FC<{
  onValueChange: (disabled: boolean) => void;
  initialValue: string;
}> = ({ onValueChange, initialValue }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    onValueChange(value.trim() === '' || value === initialValue);
  }, [value, onValueChange, initialValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className='space-y-2'>
      <p className='mt-2 text-sm font-medium'>New name</p>
      <Input
        value={value}
        onChange={handleInputChange}
        placeholder='New name'
        autoComplete='off'
        className='h-11 rounded-[12px]'
      />
    </div>
  );
};

const getRenameConfig = (
  initialValue: string,
  onValueChange: (disabled: boolean) => void,
) => ({
  icon: <Edit className='size-4 text-primary' />,
  title: 'Rename Item',
  alertDialogTitle: {
    className: 'flex items-center gap-2',
  },
  description: 'Provide a new name for the selected item.',
  contentSlot: (
    <RenameConfirmContent
      onValueChange={onValueChange}
      initialValue={initialValue}
    />
  ),
  confirmText: 'Rename',
  cancelText: 'Cancel',
  confirmButton: {
    variant: 'default' as const,
    className: 'w-full sm:w-auto rounded-[12px]',
  },
  cancelButton: {
    variant: 'outline' as const,
    className: 'w-full sm:w-auto rounded-[12px]',
  },
  alertDialogContent: {
    className: 'max-w-xl !rounded-[16px]',
  },
});
function BlockOptions(
  props: Block & {
    children: ReactNode;
    setIsOpen: (state: boolean) => void;
  },
) {
  const confirm = useConfirm();

  async function handleDelete({ type }: { type: BlockType }) {
    const isConfirmed = await confirm({
      title: `Delete ${type === BlockType.Group ? 'Group' : 'Block'}`,
      icon: <Trash2 className='size-5 text-destructive' />,
      description: `Are you sure you want to delete this ${
        type === BlockType.Group ? 'Group' : 'Block'
      }? This action cannot be undone.`,
      confirmText: 'Yes, delete',
      cancelText: 'Cancel',
      cancelButton: {
        size: 'default',
        variant: 'outline',
        className: 'rounded-[12px]',
      },
      confirmButton: {
        className: 'bg-red-500 hover:bg-red-600 text-white rounded-[12px]',
      },
      alertDialogTitle: {
        className: 'flex items-center gap-2',
      },
      alertDialogContent: {
        className: '!rounded-[16px]',
      },
    });
    if (isConfirmed) {
      toast.success(
        `${type === BlockType.Group ? 'Group' : 'Block'} deleted successfully.`,
      );
    }
  }

  async function handleRename(initialName: string) {
    const confirmConfig = getRenameConfig(initialName, (disabled) => {
      confirm.updateConfig((prev) => ({
        ...prev,
        confirmButton: { ...prev.confirmButton, disabled },
      }));
    });

    const isConfirmed = await confirm(confirmConfig);

    if (isConfirmed) {
      toast.success(
        `${props.type === BlockType.Group ? 'Group' : 'Block'} renamed successfully.`,
      );
    }
  }

  async function handleDuplicate({ name }: { name: string }) {
    const isConfirmed = await confirm({
      title: `Duplicate ${name}`,
      icon: <CopyPlus className='size-5 text-black' />,
      description: `Are you sure you want to duplicate "${name}"? This action will create a copy.`,
      confirmText: 'Yes, duplicate',
      cancelText: 'Cancel',
      cancelButton: {
        size: 'default',
        variant: 'outline',
        className: 'rounded-[12px]',
      },
      confirmButton: {
        className: 'rounded-[12px]',
      },
      alertDialogTitle: {
        className: 'flex items-center gap-2',
      },
      alertDialogContent: {
        className: '!rounded-[16px]',
      },
    });

    if (isConfirmed) {
      toast.success(`"${name}" duplicated successfully.`);
    }
  }

  return (
    <DropdownMenu onOpenChange={(e) => props.setIsOpen(e)}>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent className='mr-8 w-56 rounded-[12px] shadow-md'>
        {props.type === BlockType.Group ? (
          <DropdownMenuLabel>Group Options</DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel>Block Options</DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleRename(props.name)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className={props.type === BlockType.Group ? 'hidden' : ''}
          >
            Edit Label
          </DropdownMenuItem>
          <DropdownMenuItem
            className={props.type === BlockType.Group ? 'hidden' : ''}
          >
            Edit Metric(s)
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator
          className={props.type === BlockType.Group ? 'hidden' : ''}
        />
        <DropdownMenuGroup
          className={props.type === BlockType.Group ? 'hidden' : ''}
        >
          <DropdownMenuItem
            onClick={() => handleDuplicate({ name: props.name })}
          >
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleDelete({ type: props.type })}
            className='hover:!text-destructive'
          >
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
    value: ChartType.Area,
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
    value: ChartType.Bar,
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
    value: ChartType.Combo,
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
    value: ChartType.BarList,
    description:
      'Displays data in a vertical bar chart format, ideal for comparing multiple categories.',
    chart: <BarList data={BarListData} />,
  },
];

const blockCompactType: BlockShowcaseType[] = [
  {
    name: 'Pie Chart',
    value: ChartType.Pie,
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
    value: ChartType.Radar,
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
  groupkey?: string;
}) {
  const [value, setValue] = useState<number>(-1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogStackOpen, setIsDialogStackOpen] = useState(false);
  return (
    <DialogStack open={isDialogStackOpen} onOpenChange={setIsDialogStackOpen}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild className='max-sm:w-full'>
          {props.children}
        </DialogTrigger>
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
              <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1'>
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
            <BlocksDialogStack
              setIsDialogStackOpen={setIsDialogStackOpen}
              setIsDialogOpen={setIsDialogOpen}
              type={value}
              groupKey={props.groupkey}
            >
              <Button
                className='w-fit rounded-[12px] max-md:mb-2'
                disabled={value === -1 ? true : false}
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
      {props.value === ChartType.BarList ? (
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

function BlocksDialogStack(props: {
  children: ReactNode;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsDialogStackOpen: Dispatch<SetStateAction<boolean>>;
  type: number;
  groupKey?: string;
}) {
  const blockSelected = useMemo(
    () => findBlockByValue(props.type),
    [props.type],
  );
  const [nameInputValue, setNameInputValue] = useState<string>('');

  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
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
            </div>
          </div>
          <DialogStackFooter>
            <DialogStackPrevious asChild>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Previous
              </Button>
            </DialogStackPrevious>
            <DialogStackNext asChild>
              <Button className='rounded-[12px]' disabled={false}>
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
              <MetricSelect
                selectedMetrics={selectedMetrics}
                setSelectedMetrics={setSelectedMetrics}
              />
            </div>
          </div>
          <DialogStackFooter>
            <DialogStackPrevious asChild>
              <Button className='rounded-[12px]' variant={'secondary'}>
                Previous
              </Button>
            </DialogStackPrevious>
            <Button
              className='rounded-[12px]'
              disabled={selectedMetrics.length === 0}
              onClick={() => {
                props.setIsDialogOpen(false);
                props.setIsDialogStackOpen(false);
                const project = projects[activeProject];
                const newBlock: Block = {
                  id: 0,
                  uniquekey: generateString(10),
                  name: nameInputValue,
                  type:
                    props.groupKey === undefined
                      ? BlockType.Default
                      : BlockType.Nested,
                  chartType: props.type,
                  label: 'overview',
                  metricIds: selectedMetrics.map((metric) => metric.id),
                  color: '',
                };
                if (props.groupKey !== undefined) {
                  const layout =
                    project.blocks?.layout.filter(
                      (l) => l.uniquekey === props.groupKey,
                    ) ?? [];
                  if (layout.length === 0) {
                    toast.error('Block does not exist');
                    return;
                  }
                  const length = layout[0].nested ? layout[0].nested.length : 0;
                  if ((length ?? 0) >= 3) {
                    toast.error('Cannot have more than 3 blocks in a group');
                    return;
                  }

                  newBlock.id = length;
                  setProjects(
                    projects.map((proj, i) =>
                      i === activeProject
                        ? Object.assign({}, proj, {
                            blocks: Object.assign({}, proj.blocks, {
                              layout: proj.blocks?.layout.map((l) =>
                                l.uniquekey === props.groupKey
                                  ? Object.assign({}, l, {
                                      nested: [
                                        ...(l.nested ? l.nested : []),
                                        newBlock,
                                      ],
                                    })
                                  : l,
                              ),
                            }),
                          })
                        : proj,
                    ),
                  );
                } else {
                  newBlock.id =
                    project.blocks === null
                      ? 1
                      : project.blocks.layout.length + 1;
                  setProjects(
                    projects.map((proj, i) =>
                      i === activeProject
                        ? Object.assign({}, proj, {
                            blocks: Object.assign({}, proj.blocks, {
                              layout: [
                                ...(proj.blocks === null
                                  ? []
                                  : proj.blocks.layout),
                                newBlock,
                              ],
                            }),
                          })
                        : proj,
                    ),
                  );
                }
              }}
            >
              Create block
            </Button>
          </DialogStackFooter>
        </DialogStackContent>
      </DialogStackBody>
    </>
  );
}

interface ColorDropdownProps {
  selectedColor: string | undefined;
  setSelectedColor: Dispatch<SetStateAction<string | undefined>>;
}

export function ColorDropdown({
  selectedColor,
  setSelectedColor,
}: ColorDropdownProps) {
  const colors: Record<
    | 'pink'
    | 'blue'
    | 'purple'
    | 'lightblue'
    | 'green'
    | 'teal'
    | 'orange'
    | 'red'
    | 'yellow'
    | 'cyan'
    | 'indigo'
    | 'lime'
    | 'coral'
    | 'skyblue'
    | 'magenta'
    | 'lavender'
    | 'aquamarine'
    | 'gold'
    | 'salmon'
    | 'chartreuse',
    string
  > = {
    pink: '#b03060',
    blue: '#1c3d7c',
    purple: '#4b0082',
    lightblue: '#34699a',
    green: '#2a6e4b',
    teal: '#005f60',
    orange: '#b65c22',
    red: '#8b0000',
    yellow: '#b8860b',
    cyan: '#006b6b',
    indigo: '#2a275f',
    lime: '#3b5f33',
    coral: '#a34233',
    skyblue: '#2d5c86',
    magenta: '#730073',
    lavender: '#574b90',
    aquamarine: '#2e8b57',
    gold: '#8b7500',
    salmon: '#803636',
    chartreuse: '#4b6b3c',
  };

  return (
    <Select
      onValueChange={(value: keyof typeof colors) =>
        setSelectedColor(colors[value])
      }
    >
      <SelectTrigger
        className='size-8 h-8 w-8 rounded-full border'
        style={{
          backgroundColor: `${selectedColor}66`,
          borderColor: `${selectedColor}33` || '#ccc',
        }}
      />
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Colors</SelectLabel>
          {Object.entries(colors).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              <div className='flex flex-row items-center gap-2'>
                <div
                  className='inline-block size-4 rounded-full'
                  style={{
                    backgroundColor: `${value}66`,
                    borderColor: `${value}33` || '#ccc',
                  }}
                />
                <div>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
