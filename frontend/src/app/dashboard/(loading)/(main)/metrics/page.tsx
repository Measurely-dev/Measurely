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
import Empty from '@/components/dashboard/empty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArchiveIcon } from '@radix-ui/react-icons';
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
import { AppsContext } from '@/dash-context';
import { Loader } from 'lucide-react';

export default function DashboardMetrics() {
  const { applications, activeApp } = useContext(AppsContext);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('new');

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
      {/* /Breadcrumb */}
      <div className='mt-5 flex h-full flex-row gap-5'>
        {applications[activeApp].groups === null ? (
          <div className='flex h-[calc(100vh-50px-15px-200px)] w-full items-center justify-center'>
            <Loader className='size-8 animate-spin' />
          </div>
        ) : (
          <div className='flex w-full flex-col gap-[10px]'>
            <div className='flex w-full flex-row gap-[10px] max-md:flex-col'>
              <SearchComponent search={search} setSearch={setSearch} />
              <FiltersComponent filter={filter} setFilter={setFilter} />
              <Link href={'/dashboard/new-metric'}>
                <Button className='h-full gap-[8px] rounded-[12px] max-md:w-full'>
                  <Plus className='size-[16px]' />
                  Add metric
                </Button>
              </Link>
            </div>

            {applications[activeApp].groups?.length === 0 ? (
              <Empty>
                <ArchiveIcon className='size-10' />
                <div className='flex flex-col items-center gap-3 text-center'>
                  No metric created yet
                </div>
              </Empty>
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
      <SelectTrigger className='w-[220px] min-w-[220px] bg-accent max-md:w-full'>
        <SelectValue placeholder='Select filter' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value='new'>Newest to oldest</SelectItem>
          <SelectItem value='old'>Oldest to newest</SelectItem>
          <SelectItem value='total'>Total value</SelectItem>
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
    <div className='flex w-full flex-row items-center gap-2 rounded-[12px] bg-accent pl-[12px]'>
      <Search className='size-[18px] text-secondary' />
      <Input
        className='h-[40px] w-full rounded-none border-none bg-transparent px-0 !ring-0'
        placeholder='Search metric...'
        value={props.search}
        onChange={(e) => props.setSearch(e.target.value)}
      />
    </div>
  );
}
