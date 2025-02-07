'use client';

// Import necessary components and utilities
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  FloatingPanelBody,
  FloatingPanelContent,
  FloatingPanelRoot,
  FloatingPanelTrigger,
} from '@/components/ui/floating-panel';
import { ProjectsContext } from '@/dash-context';
import { UserRole } from '@/types';
import { roleToString } from '@/utils';
import { CaretSortIcon, CheckIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useContext, useMemo, useState } from 'react';

// Component for displaying and selecting projects in a dropdown panel
export default function ProjectsDropdown() {
  // State for panel open/close
  const [open, setOpen] = useState(false);

  // Get projects context
  const { projects, activeProject, setActiveProject } =
    useContext(ProjectsContext);

  // Handle selection of a project
  const handleAppSelect = async (id: string) => {
    const index = projects.findIndex((proj) => proj.id === id);

    if (index <= projects.length - 1) {
      setActiveProject(index);
    }
    setOpen(false);
  };

  // Memoized list of projects owned by user
  const ownedProjects = useMemo(() => {
    const filtered = projects.filter(
      (proj) => proj.user_role === UserRole.Owner,
    );
    return filtered.sort((a, b) =>
      a.id === projects[activeProject].id
        ? -1
        : b.id === projects[activeProject].id
          ? 1
          : 0,
    );
  }, [projects, activeProject]);

  // Memoized list of projects user has joined but doesn't own
  const joinedProjects = useMemo(() => {
    const filtered = projects.filter(
      (proj) => proj.user_role !== UserRole.Owner,
    );
    return filtered.sort((a, b) =>
      a.id === projects[activeProject].id
        ? -1
        : b.id === projects[activeProject].id
          ? 1
          : 0,
    );
  }, [projects, activeProject]);

  // Style classes for different role badges
  const badgeClasses: { [key: string]: string } = {
    Owner:
      'bg-green-500/10 text-green-500 border !rounded-[12px] border-green-500/20',
    Admin:
      'bg-blue-500/5 text-blue-500 border !rounded-[12px] border-blue-500/20',
    Developer:
      'bg-purple-500/5 text-purple-500 border !rounded-[12px] border-purple-500/20',
    Guest:
      'bg-zinc-500/5 text-zinc-500 border !rounded-[12px] border-zinc-500/20',
  };

  return (
    <FloatingPanelRoot onOpenChange={setOpen} open={open}>
      <FloatingPanelTrigger
        className={`h-10 w-fit gap-2 !rounded-[12px] border border-transparent px-4 text-[14px] capitalize transition-colors duration-200 hover:border-input hover:bg-accent`}
        title='Select Project'
      >
        <div className='flex h-9 flex-row items-center gap-2'>
          <Avatar className='size-6 border bg-accent'>
            <AvatarImage src={projects[activeProject].image} />
            <AvatarFallback>
              {projects[activeProject]
                ? projects[activeProject].name.charAt(0).toUpperCase()
                : ''}
            </AvatarFallback>
          </Avatar>
          {projects[activeProject] ? projects[activeProject].name : ''}
          <CaretSortIcon className='size-5 shrink-0 text-muted-foreground opacity-80' />
        </div>
      </FloatingPanelTrigger>
      <FloatingPanelContent className='w-[300px]' side='left'>
        <FloatingPanelBody className='flex flex-col gap-2 p-2'>
          {/* Render owned projects */}
          {ownedProjects.map((app) => (
            <div
              key={app.id}
              className={`flex w-full cursor-pointer select-none flex-row items-center justify-between rounded-[10px] p-2 py-1.5 capitalize hover:bg-accent/75`}
              onClick={() => handleAppSelect(app.id)}
            >
              <div className='w-6'>
                <CheckIcon
                  className={`size-4 ${projects[activeProject].id === app.id ? '' : 'hidden'}`}
                />
              </div>
              <div className='flex w-full flex-row items-center justify-center gap-2 truncate'>
                <Avatar className='size-6 border bg-accent'>
                  <AvatarImage src={app.image} />
                  <AvatarFallback>
                    {app.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 truncate text-[14px] font-medium'>
                  {app.name}
                </div>
                <div className='my-auto line-clamp-1 h-fit w-fit items-center font-mono text-[15px]'>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClasses[roleToString(app.user_role)]}`}
                  >
                    {roleToString(app.user_role)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {/* Render joined projects */}
          {joinedProjects.map((app) => (
            <div
              key={app.id}
              className={`flex w-full cursor-pointer select-none flex-row items-center justify-between rounded-xl p-2 py-1.5 capitalize hover:bg-accent/75`}
              onClick={() => handleAppSelect(app.id)}
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
                className={`size-4 ${projects[activeProject].id === app.id ? '' : 'hidden'}`}
              />
            </div>
          ))}
          {/* Create new project button */}
          <Link href={'/new-project'}>
            <Button
              variant={'default'}
              className='flex h-fit w-full items-center gap-1 rounded-[10px] p-2 py-1.5 font-medium'
            >
              <PlusIcon className='size-4' />
              Create project
            </Button>
          </Link>
        </FloatingPanelBody>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}
