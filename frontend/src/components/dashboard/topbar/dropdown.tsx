'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserContext } from '@/dash-context';
import { RocketIcon, Sparkle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useContext } from 'react';
import { ArrowUpRight } from 'react-feather';
import PlansDialog from '../plans-dialog';

function Capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AvatarDropdown(props: { children: ReactNode }) {
  const router = useRouter();

  const { user } = useContext(UserContext);

  function planBadge() {
    switch (user?.plan.identifier) {
      case 'starter':
        return (
          <PlansDialog>
            <Button
              className='h-[25px] w-full animate-gradient gap-2 rounded-[6px] bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500'
              size={'sm'}
            >
              <RocketIcon className='size-3' />
              Upgrade
            </Button>
          </PlansDialog>
        );
      default:
        return (
          <div className='ml-2 flex w-fit animate-gradient flex-row items-center gap-1 rounded-full bg-accent bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 px-2 py-0.5 text-xs font-medium text-white'>
            <Sparkle className='size-3' />
            {user?.plan.name}
          </div>
        );
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent className='mr-4 mt-1 w-56 gap-1 rounded-[16px] px-2 py-3 pb-2 shadow-sm'>
        <div className='mb-2 flex flex-col gap-0'>
          <DropdownMenuLabel className='py-0 text-sm'>
            {Capitalize(user?.firstname ?? 'Unknown')}{' '}
            {Capitalize(user?.lastname ?? '')}
          </DropdownMenuLabel>
          <DropdownMenuLabel className='py-0 text-xs font-normal text-secondary'>
            {user?.email}
          </DropdownMenuLabel>
          <div className='mt-2'>{planBadge()}</div>
        </div>
        {/* Separator */}
        <DropdownMenuSeparator />
        {/* Menu item */}
        <DropdownMenuItem className='rounded-xl p-2 px-3 text-sm font-normal'>
          Discord
          <DropdownMenuShortcut>
            <ArrowUpRight className='h-3 w-3' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <Link href='/help'>
          <DropdownMenuItem className='rounded-xl p-2 px-3 text-sm font-normal'>
            Support
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <button
          className='w-full'
          onClick={() => {
            fetch(process.env.NEXT_PUBLIC_API_URL + '/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            }).then(() => {
              router.push('/sign-in');
            });
          }}
        >
          <DropdownMenuItem className='rounded-xl bg-red-500/0 p-2 px-3 text-sm font-normal !text-red-500 transition-all hover:!bg-red-500/20'>
            Log out
          </DropdownMenuItem>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
