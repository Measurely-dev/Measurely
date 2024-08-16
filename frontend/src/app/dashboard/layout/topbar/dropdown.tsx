import { capitalizeFirstLetter } from '@/app/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserContext } from '@/contexts/userContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useContext } from 'react';
import { ArrowUpRight } from 'react-feather';
export default function AvatarDropdown(props: { children: ReactNode }) {
  const { user } = useContext(UserContext);
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent className='mr-4 mt-1 w-56 gap-1 rounded-[16px] px-2 py-3 pb-2 shadow-sm'>
        <div className='mb-2 flex flex-col gap-0'>
          <DropdownMenuLabel className='py-0 text-sm'>
            {capitalizeFirstLetter(user.value.first_name ?? 'unknown')}{' '}
            {capitalizeFirstLetter(user.value.last_name ?? 'unknown')}
          </DropdownMenuLabel>
          <DropdownMenuLabel className='py-0 text-xs font-normal text-secondary'>
            {user.value.email}
          </DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Menu item */}
          <DropdownMenuItem className='rounded-xl p-2 px-3 text-sm font-normal'>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {/* Separator */}
        <DropdownMenuSeparator />
        {/* Menu item */}
        <DropdownMenuItem className='rounded-xl p-2 px-3 text-sm font-normal'>
          GitHub
          <DropdownMenuShortcut>
            <ArrowUpRight className='h-3 w-3' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className='rounded-xl p-2 px-3 text-sm font-normal'>
          Discord
          <DropdownMenuShortcut>
            <ArrowUpRight className='h-3 w-3' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {/* Separator */}
        <DropdownMenuSeparator />
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            fetch('/api/logout', { method: 'POST' }).then(() => {
              router.push("/sign-in")
            })
          }}
        >
          <button className='w-full' type='submit'>
            <DropdownMenuItem className='rounded-xl p-2 px-3 text-sm font-normal'>
              Log out
              {/* Dropdown menu shortcut */}
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
