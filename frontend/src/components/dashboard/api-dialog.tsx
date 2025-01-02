'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { EyeClosedIcon } from '@radix-ui/react-icons';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { Eye } from 'react-feather';
import { ProjectsContext } from '@/dash-context';
import { Loader, Shuffle, X } from 'lucide-react';
import { useConfirm } from '@omit/react-confirm-dialog';
import { toast } from 'sonner';

export default function ApiDialog(props: {
  children: ReactNode;
  randomize?: boolean | false;
  projectid: string;
}) {
  const [view, setView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const confirm = useConfirm();
  const [apiIndex, setApiIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (projects !== null) {
      setApiIndex(projects.findIndex((proj) => proj.id === props.projectid));
    }
  }, []);
  const RandomizeAPI = async () => {
    const isConfirmed = await confirm({
      title: 'Randomize API Key',
      icon: <Shuffle className='size-6 text-destructive' />,
      description:
        'Are you sure you want to randomize your API key? This will invalidate the current key, and all requests using it will stop working.',
      confirmText: 'Yes, Randomize',
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
      fetch(process.env.NEXT_PUBLIC_API_URL + '/rand-apikey', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectid: apiIndex !== undefined ? projects?.[apiIndex].id : '',
        }),
        credentials: 'include',
      })
        .then((res) => {
          if (res.ok === true) {
            return res.text();
          } else {
            toast.error('Failed to generate a new API KEY. Try again later.');
          }
        })
        .then((data) => {
          if (data !== null && data !== undefined && projects !== null) {
            toast.success('API key succesfully randomized');
            setProjects(
              projects?.map((v, i) =>
                i === apiIndex
                  ? Object.assign({}, v, {
                      apikey: data,
                    })
                  : v,
              ),
            );
          }
        });
    }
  };

  useEffect(() => {
    if (projects !== null && projects.length > 0) {
      const appIndex = projects.findIndex((app) => app.id === props.projectid);
      if (appIndex !== -1 && projects[appIndex].apikey !== null) {
        setApiKey(projects[appIndex].apikey);
      }
    }
  }, [activeProject, projects]);

  return (
    <Dialog onOpenChange={() => setView(false)}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='rounded-xl border border-input shadow-none max-md:max-w-[95%] max-sm:w-full max-sm:max-w-full max-sm:rounded-none max-sm:px-2 max-sm:py-4'>
        <DialogHeader className='max-md:text-start'>
          <DialogTitle>API KEY</DialogTitle>
          <DialogDescription>
            Anyone who has this key will be able to use it.
          </DialogDescription>
          <DialogClose className='absolute right-5 top-3 max-sm:hidden'>
            <Button
              type='button'
              size={'icon'}
              variant='secondary'
              className='rounded-[12px]'
            >
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className='flex max-w-full items-center'>
          <div className='flex w-full max-w-full flex-row gap-2'>
            <Label htmlFor='link' className='sr-only'>
              Link
            </Label>
            <Button
              id='link'
              className={`w-full overflow-x-scroll rounded-[8px] rounded-r-none border-r-0 max-sm:max-w-[calc(100vw-16px-40px)] max-sm:text-xs ${
                view ? '' : 'text-secondary'
              }`}
              variant={'outline'}
              onClick={() => {
                if (apiKey !== null) {
                  navigator.clipboard.writeText(apiKey);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1000);
                }
              }}
            >
              {copied ? (
                'Copied!'
              ) : apiKey !== null ? (
                view ? (
                  apiKey
                ) : (
                  'Click to copy'
                )
              ) : (
                <Loader className='size-4 animate-spin' />
              )}
            </Button>
          </div>
          <Button
            onClick={() => setView(!view)}
            size='sm'
            variant={'secondary'}
            className='h-full rounded-[8px] rounded-l-none border border-l-0 px-3'
          >
            <span className='sr-only'>View</span>
            {view ? (
              <EyeClosedIcon className='h-4 w-4' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
          </Button>
        </div>
        {props.randomize ? (
          <Button
            onClick={RandomizeAPI}
            className='rounded-[12px]'
            variant={'destructiveOutline'}
          >
            Randomize key
          </Button>
        ) : undefined}
      </DialogContent>
    </Dialog>
  );
}
