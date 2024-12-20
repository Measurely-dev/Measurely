import React from 'react';
import { Button } from '@/components/ui/button';
import { useContext, useEffect, useState } from 'react';
import { AppsContext } from '@/dash-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ApiDialog from '../api-dialog';
import { Plus } from 'react-feather';
import Link from 'next/link';
import { FileQuestion, Key, MoreHorizontal, Search } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import EditAppDialogContent from '../edit-app-dialog-content';
import DeleteAppDialogContent from '../delete-app-dialog-content';
import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Application } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';

export default function SettingAppsPage() {
  const { activeApp, applications } = useContext(AppsContext);
  const [sortedApplications, setSortedApplications] = useState<any>([]);

  const [selectedApp, setSelectedApp] = useState<Application>(applications[0]);

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
        <div className='flex flex-col gap-8'>
          {sortedApplications.length === 0 ? (
            <EmptyState
              title='No Application Found'
              description='Try creating one.'
              icons={[Search, FileQuestion]}
            />
          ) : (
            sortedApplications.map((app: Application, i: number) => {
              return (
                <div key={i} className='flex items-center justify-between'>
                  <div className='flex flex-row items-center gap-2'>
                    <Avatar className='size-10 rounded-[12px] border bg-accent'>
                      <AvatarImage
                        src={`${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${app.image}`}
                      />
                      <AvatarFallback>
                        {app.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <p className='text-sm font-medium leading-none'>
                        {app.name}
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
                        <AlertDialogTrigger className='w-full'>
                          <DropdownMenuItem
                            className='bg-red-500/0 !text-red-500 transition-all hover:!bg-red-500/20'
                            onClick={() => setSelectedApp(app)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <EditAppDialogContent app={selectedApp} />
        <DeleteAppDialogContent app={selectedApp} />
      </AlertDialog>
    </Dialog>
  );
}
