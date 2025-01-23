import { Button } from '@/components/ui/button';
import { useContext, useEffect, useState } from 'react';
import { ProjectsContext } from '@/dash-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ApiDialog from '../api-dialog';
import Link from 'next/link';
import {
  FileQuestion,
  Key,
  MoreHorizontal,
  Plus,
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
import { Project, UserRole } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';
import { useConfirm } from '@omit/react-confirm-dialog';
import { loadMetrics } from '@/utils';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/project`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: project.id }),
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
            const toRemove = projects?.findIndex(
              (proj) => proj.id === project.id,
            );
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
        ...projects.filter(
          (proj) => proj.name === projects[activeProject]?.name,
        ),
        ...projects.filter(
          (proj) =>
            proj.user_role === UserRole.Owner &&
            proj.name !== projects[activeProject]?.name,
        ),

        ...projects.filter(
          (proj) =>
            proj.user_role !== UserRole.Owner &&
            proj.name !== projects[activeProject]?.name,
        ),
      ];
      setSortedProjects(sorted);
    }
  }, [projects]);

  return (
    <Dialog>
      <AlertDialog>
        <Link href={'/dashboard/new-project'}>
          <Button
            variant={'secondary'}
            size={'lg'}
            className='w-full rounded-[12px] py-5'
          >
            <Plus className='mr-2 size-4' />
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
              <Table className='overflow-hidden rounded-[12px]'>
                <TableCaption>A list of your projects.</TableCaption>
                <TableHeader>
                  <TableRow className='bg-accent/60'>
                    <TableHead className='w-[80px] min-w-[80px]'>
                      Image
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className='text-right' colSpan={4}>
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProjects.map((proj: Project, i: number) => {
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <Avatar className='size-10 rounded-full border bg-accent'>
                            <AvatarImage src={proj.image} />
                            <AvatarFallback>
                              {proj.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          {proj.name.charAt(0).toUpperCase() +
                            proj.name.slice(1).toLowerCase()}
                        </TableCell>
                        <TableCell className='w-full' colSpan={4}>
                          <div className='flex w-full flex-row items-center justify-end gap-2'>
                            {proj.user_role !== UserRole.Guest && (
                              <ApiDialog randomize projectid={proj.id}>
                                <Button
                                  variant={'outline'}
                                  size={'icon'}
                                  className='rounded-[12px] hover:bg-background'
                                >
                                  <Key className='size-4' />
                                </Button>
                              </ApiDialog>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size={'icon'}
                                  variant={'ghost'}
                                  className='rounded-[12px] hover:bg-background'
                                  disabled={
                                    proj.user_role === UserRole.Guest ||
                                    proj.user_role === UserRole.Developer
                                  }
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
                          </div>{' '}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className='text-right'>
                      {sortedProjects.length}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </div>
        <EditAppDialogContent project={selectedProject} />
      </AlertDialog>
    </Dialog>
  );
}
