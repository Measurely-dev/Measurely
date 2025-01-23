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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/components/ui/select';
import { Plus, Search } from 'react-feather';
import MetricTable from './metric-table';
import Link from 'next/link';
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { BoxIcon, CurlyBraces, Link2Icon, Loader } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { useRouter } from 'next/navigation';
import { ProjectsContext } from '@/dash-context';
import { UserRole } from '@/types';

export default function DashboardMetrics() {
  const { projects, activeProject } = useContext(ProjectsContext);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('total');
  const router = useRouter();
  const [activeMetric, setActiveMetric] = useState(0);

  useEffect(() => {
    document.title = 'Metrics | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Manage your metrics and analyze data all in one place. Measurely helps you organize, track, and gain insights to make data-driven decisions effectively.',
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
    <DashboardContentContainer className='mt-0 flex w-full pb-[15px] pt-[15px]'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className='pointer-events-none'>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Metrics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='mt-5 flex h-full flex-row gap-5'>
        {projects[activeProject].metrics === null ? (
          <div className='flex h-[calc(100vh-50px-15px-200px)] w-full items-center justify-center'>
            <Loader className='size-5 animate-spin' />
          </div>
        ) : (
          <div className='flex w-full flex-col gap-[10px]'>
            <div className='flex w-full flex-row gap-[10px] max-md:flex-col'>
              <SearchComponent search={search} setSearch={setSearch} />
              <FiltersComponent filter={filter} setFilter={setFilter} />
              <Link href={'/dashboard/new-metric'}>
                <Button
                  className='h-full gap-[8px] rounded-[12px] max-md:w-full'
                  disabled={
                    projects[activeProject].user_role !== UserRole.Admin &&
                    projects[activeProject].user_role !== UserRole.Owner
                  }
                >
                  <Plus className='size-[16px]' />
                  Add metric
                </Button>
              </Link>
            </div>
            {projects[activeProject].metrics?.length === 0 ? (
              <EmptyState
                className='w-full'
                title='No Metric Created'
                description='You can create a new metric to start tracking values.'
                icons={[CurlyBraces, BoxIcon, Link2Icon]}
                action={
                  projects[activeProject].user_role === UserRole.Owner ||
                  projects[activeProject].user_role === UserRole.Admin
                    ? {
                        label: 'Create metric',
                        onClick: () => router.push('/dashboard/new-metric'),
                      }
                    : undefined
                }
              />
            ) : (
              <MetricTable search={search} filter={filter} />
            )}
          </div>
        )}
      </div>
    </DashboardContentContainer>
  );
}

function FiltersComponent(props: {
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}) {
  return (
    <Select value={props.filter} onValueChange={props.setFilter}>
      <SelectTrigger className='w-[220px] border-none min-w-[220px] bg-accent max-md:w-full'>
        <SelectValue placeholder='Select filter' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sort by</SelectLabel>
          <SelectSeparator />
          <SelectItem value='total'>Total value</SelectItem>
          <SelectItem value='new'>Newest to oldest</SelectItem>
          <SelectItem value='old'>Oldest to newest</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SearchComponent(props: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className='flex w-full shadow-sm shadow-black/5 flex-row items-center gap-2 rounded-[12px] bg-accent pl-[12px]'>
      <Search className='size-[18px] text-secondary' />
      <Input
        className='h-[40px] w-full rounded-none shadow-none border-none bg-transparent px-0 !ring-0'
        placeholder='Search metric...'
        value={props.search}
        onChange={(e) => props.setSearch(e.target.value)}
      />
    </div>
  );
}
