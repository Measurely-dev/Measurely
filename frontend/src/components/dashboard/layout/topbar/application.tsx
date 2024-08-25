'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CaretSortIcon, CheckIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ApplicationsChip() {
  const [open, setOpen] = useState(false);
  const teams = [
    {
      image: 'https://avatars.githubusercontent.com/u/13409222?s=80&v=4',
      identifier: 'Electron',
      name: 'Electron'
    },
    {
      image: 'https://avatars.githubusercontent.com/u/21003710?s=80&v=4',
      identifier: 'Pytorch',
      name: 'PyTorch'
    },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={`w-fit gap-2 rounded-[12px] border-none px-2 text-[14px] ${open ? 'bg-accent' : ''}`}
        >
          <Avatar className='size-6 border bg-accent'>
            <AvatarImage src={'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/google/google.png?size=48'} />
            <AvatarFallback>
              G
            </AvatarFallback>
          </Avatar>
          Google inc
          <CaretSortIcon className='size-5 shrink-0 text-secondary opacity-80' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='flex w-[250px] flex-col gap-1 rounded-2xl p-1.5 shadow-sm'
        side='bottom'
        align='start'
      >
        {teams.map((team, i) => {
          return (
            <div
              key={i}
              className='flex w-full cursor-pointer select-none flex-row items-center justify-between rounded-xl p-2 py-1.5 hover:bg-accent/75'
            >
              <div className='flex flex-row items-center justify-center gap-2'>
                <Avatar className='size-6 border bg-accent'>
                  <AvatarImage src={team.image ?? ''} />
                  <AvatarFallback>
                    {team.identifier[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='text-[14px] font-medium'>{team.name}</div>
              </div>
              <CheckIcon
                className={`size-4 ${'' ? '' : 'hidden'}`}
              />
            </div>
          );
        })}
        <Link href={'/dashboard/new-team'}>
          <Button
            variant={'secondary'}
            className='mt-1 flex w-full items-center justify-start gap-2 rounded-xl bg-accent/75 px-2 text-[14px] font-normal'
          >
            <PlusIcon className='ml-1 mr-1 size-4 stroke-2' />
            New Application
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
