import React from 'react';
import { Button } from '@/components/ui/button';
import { useContext, useEffect, useState } from 'react';
import { ProjectsContext } from '@/dash-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ApiDialog from '../api-dialog';
import Link from 'next/link';
import {
  ChartNoAxesCombined,
  FileQuestion,
  Key,
  MoreHorizontal,
  Search,
  Trash,
} from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import EditAppDialogContent from '../edit-project-dialog-content';
import { AlertDialog } from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';
import { useConfirm } from '@omit/react-confirm-dialog';
import { loadMetrics } from '@/utils';
import { toast } from 'sonner';

export default function SettingProjectPage() {
  const { activeProject, projects, setProjects, setActiveProject } =
    useContext(ProjectsContext);
  const [sortedProjects, setSortedProjects] = useState<any>([]);
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const confirm = useConfirm();

  const DeleteProject = async (project: Project) => {
    const isConfirmed = await confirm({
      title: 'Delete ' + project.name,
      icon: <Trash className='size-6 text-destructive' />,
      description:
        'Are you sure you want to delete this app? You will loose all the data linked to this app forever.',
      confirmText: 'Yes, Delete',
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
        className: '!rounded-[12px]',
      },
    });
    if (isConfirmed) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/application`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectid: project.id }),
      }).then(async (resp) => {
        if (resp.status === 200) {
          toast.success('Successfully deleted project: ' + project.name);

          if (projects?.length === 1 || projects === undefined) {
            window.location.reload();
            return;
          }

          let newActiveProject = 0;
          if (projects?.[activeProject].id === project.id) {
            newActiveProject = 0;
          } else {
            const toRemove = projects?.findIndex((proj) => proj.id === project.id);
            if (toRemove === -1 || toRemove === undefined) return;
            if (toRemove < activeProject) {
              newActiveProject = activeProject - 1;
            }
          }

          if (projects !== null) {
            if (projects[newActiveProject].metrics === null) {
              const metrics = await loadMetrics(projects[newActiveProject].id);
              setProjects(
                projects.map((proj, id) =>
                  id === newActiveProject
                    ? Object.assign({}, proj, { metrics: metrics })
                    : proj,
                ),
              );
            }
          }

          setActiveProject(newActiveProject);
          localStorage.setItem('activeProject', newActiveProject.toString());

          setProjects(projects?.filter((proj) => proj.id !== project.id) ?? []);
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
        }
      });
    }
  };
  useEffect(() => {
    if (projects.length !== 0) {
      const sorted = [
        ...projects.filter((proj) => proj.name === projects[activeProject]?.name),
        ...projects.filter((proj) => proj.name !== projects[activeProject]?.name),
      ];
      setSortedProjects(sorted);
    }
  }, [projects, activeProject]);

  return (
    <Dialog>
      <AlertDialog>
        <Link href={'/dashboard/new-project'}>
          <Button
            variant={'secondary'}
            size={'lg'}
            className='mb-5 w-full rounded-[12px] py-5'
          >
            <ChartNoAxesCombined className='mr-2 size-4' />
            Start a new project
          </Button>
        </Link>
        <div className='flex flex-col gap-4'>
          {sortedProjects.length === 0 ? (
            <EmptyState
              title='No Project Found'
              description='Try creating one.'
              icons={[Search, FileQuestion]}
            />
          ) : (
            <div className='flex flex-col divide-y'>
              {sortedProjects.map((proj: Project, i: number) => {
                return (
                  <div
                    key={i}
                    className='flex items-center justify-between px-3 py-3 hover:bg-accent'
                  >
                    <div className='flex flex-row items-center gap-2'>
                      <Avatar className='size-10 rounded-full border bg-accent'>
                        <AvatarImage src={proj.image} />
                        <AvatarFallback>
                          {proj.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <p className='text-sm font-medium leading-none'>
                          {proj.name.charAt(0).toUpperCase() +
                            proj.name.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                      <ApiDialog randomize projectid={proj.id}>
                        <Button
                          variant={'outline'}
                          size={'icon'}
                          className='rounded-[12px] hover:bg-background'
                        >
                          <Key className='size-4' />
                        </Button>
                      </ApiDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size={'icon'}
                            variant={'ghost'}
                            className='rounded-[12px] hover:bg-background'
                          >
                            <MoreHorizontal className='size-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='mr-20'>
                          <DialogTrigger
                            className='w-full'
                            onClick={() => setSelectedProject(proj)}
                          >
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem
                            onClick={() => DeleteProject(proj)}
                            className='bg-red-500/0 !text-red-500 transition-all hover:!bg-red-500/20'
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <EditAppDialogContent project={selectedProject} />
      </AlertDialog>
    </Dialog>
  );
}
