'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TeamContext } from '@/contexts/teamContext';
import { CaretSortIcon, CheckIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useState } from 'react';

export default function TeamChip() {
  const [open, setOpen] = useState(false);
  const { teams } = useContext(TeamContext);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={`w-fit gap-2 rounded-[12px] border-none px-2 text-[14px] ${open ? 'bg-accent' : ''}`}
        >
          <Avatar className='size-6 border bg-accent p-1'>
            <AvatarImage src={teams.list[teams.activeTeam].image ?? ''} />
            <AvatarFallback>
              {teams.list[teams.activeTeam].identifier[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {teams.list[teams.activeTeam].name}
          <CaretSortIcon className='size-5 shrink-0 text-secondary opacity-80' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='flex w-[250px] flex-col gap-1 rounded-2xl p-1.5 shadow-sm'
        side='bottom'
        align='start'
      >
        {teams.list.map((team, i) => {
          return (
            <div
              onClick={() => {
                const pathname_parts = pathname
                  .split('/')
                  .filter((part) => part !== '');
                teams.set_active_team(i);
                if (pathname_parts[2] !== undefined) {
                  router.push(
                    `/dashboard/${team.identifier}/${pathname_parts[2]}`
                  );
                } else {
                  router.push(`/dashboard/${team.identifier}`);
                }
              }}
              key={i}
              className='flex w-full cursor-pointer select-none flex-row items-center justify-between rounded-xl p-2 py-1.5 hover:bg-accent/75'
            >
              <div className='flex flex-row items-center justify-center gap-2'>
                <Avatar className='size-6 border bg-accent p-1'>
                  <AvatarImage src={team.image ?? ''} />
                  <AvatarFallback>
                    {team.identifier[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='text-[14px] font-medium'>{team.name}</div>
              </div>
              <CheckIcon
                className={`size-4 ${i === teams.activeTeam ? '' : 'hidden'}`}
              />
            </div>
          );
        })}
        <Link href={'/dashboard/new-team'}>
          <Button
            variant={'secondary'}
            className='mt-1 flex w-full items-center justify-start gap-2 rounded-xl bg-accent/75 px-2 text-[14px] font-medium'
          >
            <PlusIcon className='ml-1 mr-1 size-4' />
            New team
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
