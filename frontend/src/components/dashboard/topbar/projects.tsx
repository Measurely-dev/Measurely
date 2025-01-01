'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AppsContext, UserContext } from '@/dash-context';
import { loadMetrics } from '@/utils';
import { CaretSortIcon, CheckIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function ProjectsChip() {
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { projects, activeProject, setActiveProject, setProjects } =
    useContext(AppsContext);

  const projectsLimitReached = useMemo(() => {
    return projects.length > user.plan.applimit;
  }, [projects]);

  const handleAppSelect = async (index: number) => {
    if (projectsLimitReached && index > user.plan.applimit - 1) {
      toast.error(
        'You have exceeded your plan limits. Please upgrade to unlock your projects',
      );
      return;
    }

    if (index <= projects.length - 1) {
      if (projects[index].metrics === null) {
        const metrics = await loadMetrics(projects?.[index].id ?? '');
        setProjects(
          projects?.map((app, i) =>
            i === index ? Object.assign({}, app, { metrics: metrics }) : app,
          ),
        );
      }
      setActiveProject(index);
      localStorage.setItem('activeProject', index.toString());
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
          className={`w-fit gap-2 rounded-[12px] border-none px-2 text-[14px] capitalize ${
            open ? 'bg-accent' : ''
          }`}
        >
          <Avatar className='size-6 border bg-accent'>
            <AvatarImage src={projects[activeProject].image} />
            <AvatarFallback>
              {projects[activeProject]
                ? projects[activeProject].name.charAt(0).toUpperCase()
                : ''}
            </AvatarFallback>
          </Avatar>
          {projects[activeProject] ? projects[activeProject].name : ''}
          <CaretSortIcon className='size-5 shrink-0 text-secondary opacity-80' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='flex w-[250px] flex-col gap-1 rounded-2xl p-1.5 shadow-sm'
        side='bottom'
        align='start'
      >
        {projects.map((app, i) => {
          const isBlocked =
            projectsLimitReached && i > user.plan.applimit - 1;

          return (
            <div
              key={i}
              className={`flex w-full cursor-pointer select-none flex-row items-center justify-between rounded-xl p-2 py-1.5 capitalize hover:bg-accent/75 ${
                isBlocked ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={() => {
                handleAppSelect(i);
              }}
            >
              <div className='flex flex-row items-center justify-center gap-2'>
                <Avatar className='size-6 border bg-accent'>
                  <AvatarImage src={app.image} />
                  <AvatarFallback>
                    {app.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='text-[14px] font-medium'>{app.name}</div>
              </div>
              <CheckIcon
                className={`size-4 ${activeProject === i ? '' : 'hidden'}`}
              />
            </div>
          );
        })}
        <Link href={'/dashboard/new-project'}>
          <Button
            variant={'default'}
            className='mt-1 flex w-full items-center gap-1 rounded-[12px] text-[14px] font-medium'
          >
            <PlusIcon className='size-4' />
            Create project
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
