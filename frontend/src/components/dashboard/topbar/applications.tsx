'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AppsContext, UserContext } from '@/dash-context';
import { loadMetricsGroups } from '@/utils';
import { CaretSortIcon, CheckIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { toast } from 'sonner';

export default function ApplicationsChip() {
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { applications, activeApp, setActiveApp, setApplications } =
    useContext(AppsContext);

  const applicationLimitReached =
    applications &&
    user?.plan?.applimit &&
    applications.length > user.plan.applimit;

  const handleAppSelect = async (index: number) => {
    if (applicationLimitReached && index >= user.plan.applimit) {
      toast.error('Upgrade plan to view this application');
      return;
    }

    if (applications !== null && applications.length >= index + 1) {
      if (applications[index].groups === null) {
        const groups = await loadMetricsGroups(applications?.[index].id ?? '');
        setApplications(
          applications?.map((app, i) =>
            i === index ? Object.assign({}, app, { groups: groups }) : app,
          ),
        );
      }
      setActiveApp(index);
      localStorage.setItem('activeApp', index.toString());
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={`w-fit gap-2 rounded-[12px] border-none px-2 text-[14px] capitalize ${open ? 'bg-accent' : ''
            }`}
        >
          <Avatar className='size-6 border bg-accent'>
            <AvatarImage
              src={`${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${applications[activeApp]?.image}`}
            />
            <AvatarFallback>
              {applications[activeApp] ? applications[activeApp].name.charAt(0).toUpperCase() : ''}
            </AvatarFallback>
          </Avatar>
          {applications[activeApp] ? applications[activeApp].name : ''}
          <CaretSortIcon className='size-5 shrink-0 text-secondary opacity-80' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='flex w-[250px] flex-col gap-1 rounded-2xl p-1.5 shadow-sm'
        side='bottom'
        align='start'
      >
        {applications.map((app, i) => {
          const isBlocked = applicationLimitReached && i >= user.plan.applimit;

          return (
            <div
              key={i}
              className={`flex w-full cursor-pointer select-none flex-row items-center justify-between rounded-xl p-2 py-1.5 capitalize hover:bg-accent/75 ${isBlocked ? 'cursor-not-allowed opacity-50' : ''
                }`}
              onClick={() => {
                handleAppSelect(i);
              }}
            >
              <div className='flex flex-row items-center justify-center gap-2'>
                <Avatar className='size-6 border bg-accent'>
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${app.image}`}
                  />
                  <AvatarFallback>
                    {app.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='text-[14px] font-medium'>{app.name}</div>
              </div>
              <CheckIcon
                className={`size-4 ${activeApp === i ? '' : 'hidden'}`}
              />
            </div>
          );
        })}
        <Link href={'/dashboard/new-app'}>
          <Button
            variant={'default'}
            className='mt-1 flex w-full items-center gap-1 rounded-[12px] text-[14px] font-medium'
          >
            <PlusIcon className='size-5' />
            New Application
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
