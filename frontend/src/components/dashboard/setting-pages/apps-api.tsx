import React from 'react';
import { Button } from '@/components/ui/button';
import { useContext, useEffect, useState } from 'react';
import { AppsContext } from '@/dash-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ApiDialog from '../api-dialog';
import Empty from '../empty';
import { Plus } from 'react-feather';
import Link from 'next/link';
import EditAppDialog from '../edit-app-dialog';
import { Trash } from 'lucide-react';
import DeleteAppDialog from '../delete-app-dialog';

export default function SettingAppsPage() {
  const { activeApp, applications } = useContext(AppsContext);
  const [sortedApplications, setSortedApplications] = useState<any>([]);

  useEffect(() => {
    if (applications?.length !== 0 && applications !== null) {
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
    <div>
      <Link href={'/dashboard/new-app'}>
        <Button variant={'secondary'} className='mb-5 w-full rounded-[12px]'>
          <Plus className='mr-1 size-5' />
          Create application
        </Button>
      </Link>
      <div className='flex flex-col gap-4'>
        {sortedApplications.length === 0 ? (
          <Empty>No app found</Empty>
        ) : (
          sortedApplications.map((app: any, i: any) => {
            return (
              <div
                key={i}
                className={`rounded-[16px] p-1 pr-2 ${app.name === applications?.[activeApp]?.name ? 'bg-accent' : ''}`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex flex-row items-center gap-2'>
                    <Avatar className='size-10 rounded-[12px] border bg-accent'>
                      <AvatarImage
                        src={`${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${app?.image}`}
                      />
                      <AvatarFallback>
                        {app?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <p className='text-sm font-medium leading-none'>
                        {app?.name}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-row items-center gap-2'>
                    <ApiDialog randomize appId={app?.id}>
                      <Button
                        variant={'outline'}
                        size={'sm'}
                        className='rounded-[12px]'
                      >
                        Api key
                      </Button>
                    </ApiDialog>
                    <EditAppDialog>
                      <Button
                        variant={'default'}
                        size={'sm'}
                        className='rounded-[12px]'
                      >
                        Edit
                      </Button>
                    </EditAppDialog>
                    <DeleteAppDialog>
                      <Button
                        className='rounded-[12px]'
                        variant={'destructiveOutline'}
                        size={'icon'}
                      >
                        <Trash className='size-4' />
                      </Button>
                    </DeleteAppDialog>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
