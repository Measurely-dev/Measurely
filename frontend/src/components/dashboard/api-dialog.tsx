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
import { AppsContext } from '@/dash-context';
import { X } from 'lucide-react';
import RandomizeAlert from './randomize-alert';

export default function ApiDialog(props: {
  children: ReactNode;
  randomize?: boolean | false;
  appId: string;
}) {
  const [view, setView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { applications, activeApp } = useContext(AppsContext);

  useEffect(() => {
    if (applications !== null && applications.length > 0) {
      const appIndex = applications.findIndex((app) => app.id === props.appId);
      if (appIndex !== -1 && applications[appIndex].apikey !== null) {
        setApiKey(applications[appIndex].apikey);
      }
    }
  }, [activeApp, applications]);

  return (
    <Dialog onOpenChange={() => setView(false)}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='!rounded-xl border border-input shadow-none max-md:max-w-[95%]'>
        <DialogHeader className='max-md:text-start'>
          <DialogTitle>API KEY</DialogTitle>
          <DialogDescription>
            Anyone who has this key will be able to use it.
          </DialogDescription>
          <DialogClose className='absolute right-5 top-3'>
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
        <div className='flex items-center'>
          <div className='grid flex-1 gap-2'>
            <Label htmlFor='link' className='sr-only'>
              Link
            </Label>
            <Button
              id='link'
              className={`rounded-[8px] rounded-r-none border-r-0 ${
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
              {copied
                ? 'Copied!'
                : apiKey !== null
                  ? view
                    ? apiKey
                    : 'Click to copy'
                  : 'LOADING...'}
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
          <RandomizeAlert appId={props.appId || ('' as string)}>
            <Button className='rounded-[12px]' variant={'destructiveOutline'}>
              Randomize key
            </Button>
          </RandomizeAlert>
        ) : undefined}
      </DialogContent>
    </Dialog>
  );
}
