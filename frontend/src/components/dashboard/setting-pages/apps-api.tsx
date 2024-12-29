import React from 'react';
import { Button } from '@/components/ui/button';
import { useContext, useEffect, useState } from 'react';
import { AppsContext } from '@/dash-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ApiDialog from '../api-dialog';
import { Plus } from 'react-feather';
import Link from 'next/link';
import { FileQuestion, Key, MoreHorizontal, Search, Trash } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import EditAppDialogContent from '../edit-app-dialog-content';
import { AlertDialog } from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Application } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';
import { useConfirm } from '@omit/react-confirm-dialog';
import { loadMetrics } from '@/utils';
import { toast } from 'sonner';

export default function SettingAppsPage() {
  const { activeApp, applications, setApplications, setActiveApp } =
    useContext(AppsContext);
  const [sortedApplications, setSortedApplications] = useState<any>([]);
  const [selectedApp, setSelectedApp] = useState<Application>(applications[0]);
  const confirm = useConfirm();

  const DeleteApp = async (app: any) => {
    const isConfirmed = await confirm({
      title: 'Delete ' + app?.name,
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
        body: JSON.stringify({ appid: app?.id }),
      }).then(async (resp) => {
        if (resp.status === 200) {
          toast.success('Successfully deleted application: ' + app?.name);

          if (applications?.length === 1 || applications === undefined) {
            window.location.reload();
            return;
          }

          let newActiveApp = 0;
          if (applications?.[activeApp].id === app?.id) {
            newActiveApp = 0;
          } else {
            const toRemove = applications?.findIndex(
              (app) => app.id === app?.id,
            );
            if (toRemove === -1 || toRemove === undefined) return;
            if (toRemove < activeApp) {
              newActiveApp = activeApp - 1;
            }
          }

          if (applications !== null) {
            if (applications[newActiveApp].metrics === null) {
              const metrics = await loadMetrics(applications[newActiveApp].id);
              setApplications(
                applications.map((app, id) =>
                  id === newActiveApp
                    ? Object.assign({}, app, { metrics: metrics })
                    : app,
                ),
              );
            }
          }

          setActiveApp(newActiveApp);
          localStorage.setItem('activeApp', newActiveApp.toString());

          setApplications(
            applications?.filter((app) => app.id !== app?.id) ?? [],
          );
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
        }
      });
    }
  };
  useEffect(() => {
    if (applications.length !== 0) {
      const sorted = [
        ...applications.filter(
          (app) => app.name === applications[activeApp]?.name,
        ),
        ...applications.filter(
          (app) => app.name !== applications[activeApp]?.name,
        ),
      ];
      setSortedApplications(sorted);
    }
  }, [applications, activeApp]);

  return (
    <Dialog>
      <AlertDialog>
        <Link href={'/dashboard/new-app'}>
          <Button variant={'secondary'} className='mb-5 w-full rounded-[12px]'>
            <Plus className='mr-1 size-5' />
            Create application
          </Button>
        </Link>
        <div className='flex flex-col gap-4'>
          {sortedApplications.length === 0 ? (
            <EmptyState
              title='No Application Found'
              description='Try creating one.'
              icons={[Search, FileQuestion]}
            />
          ) : (
            sortedApplications.map((app: Application, i: number) => {
              return (
                <div
                  key={i}
                  className='flex items-center justify-between rounded-[12px] p-0.5 transition-all duration-100 hover:bg-accent/50'
                >
                  <div className='flex flex-row items-center gap-2'>
                    <Avatar className='size-10 rounded-[12px] border bg-accent'>
                      <AvatarImage src={app.image} />
                      <AvatarFallback>
                        {app.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <p className='text-sm font-medium leading-none'>
                        {app.name.charAt(0).toUpperCase() +
                          app.name.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-row items-center gap-2'>
                    <ApiDialog randomize appId={app.id}>
                      <Button
                        variant={'secondary'}
                        size={'icon'}
                        className='rounded-[12px]'
                      >
                        <Key className='size-4' />
                      </Button>
                    </ApiDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size={'icon'}
                          variant={'ghost'}
                          className='rounded-[12px]'
                        >
                          <MoreHorizontal className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='mr-20'>
                        <DialogTrigger
                          className='w-full'
                          onClick={() => setSelectedApp(app)}
                        >
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem
                          onClick={() => DeleteApp(app)}
                          className='bg-red-500/0 !text-red-500 transition-all hover:!bg-red-500/20'
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <EditAppDialogContent app={selectedApp} />
      </AlertDialog>
    </Dialog>
  );
}
