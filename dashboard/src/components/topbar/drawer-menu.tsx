// UI Component imports
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Book, Code, LogOut, Plus, Settings, User } from 'react-feather';

// Next.js imports
import Link from 'next/link';
import { ReactNode, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Context and component imports
import { ProjectsContext, UserContext } from '@/dash-context';
import ApiDialog from '../api-dialog';
import { Separator } from '@/components/ui/separator';
import { navItem } from '../navbar';
import { DialogClose } from '@/components/ui/dialog';
import SettingDialog from '../setting-dialog';

// Drawer menu component that provides navigation and user controls
export const DrawerMenu = (props: { image: any; children: ReactNode }) => {
  const pathname = usePathname();
  const { user } = useContext(UserContext);
  const router = useRouter();
  const { projects, activeProject } = useContext(ProjectsContext);

  // Helper function to capitalize first letter of strings
  function Capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Handles user logout process
  const handleLogout = () => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(() => {
        router.push('/sign-in');
        window.location.reload();
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  return (
    <Drawer>
      {/* Drawer trigger only visible on mobile */}
      <DrawerTrigger className='md:hidden'>{props.children}</DrawerTrigger>
      <DrawerContent className='flex flex-col gap-2 p-10 !pt-0 max-sm:p-2'>
        {/* User profile section */}
        <Label className='flex flex-row items-center gap-4 rounded-[12px] p-2'>
          <Avatar className='size-[35px] cursor-pointer border text-muted-foreground hover:text-primary'>
            <AvatarImage src={props.image} className='rounded-full' />
            <AvatarFallback>
              <User className='size-1/2' />
            </AvatarFallback>
          </Avatar>
          <div className='flex gap-1'>
            <div>{Capitalize(user?.first_name ?? 'Unknown')}</div>
            {Capitalize(user?.last_name ?? '')}
          </div>
        </Label>
        <Separator className='my-2' orientation='horizontal' />

        {/* Navigation items */}
        {navItem?.map((item, i) => {
          return (
            <DialogClose asChild key={i}>
              <Link href={item.href}>
                <Button
                  key={i}
                  variant={'ghost'}
                  className={`${pathname === item.href ? 'bg-accent' : ''} w-full justify-start gap-1.5 rounded-[12px]`}
                >
                  {item.svg}
                  {item.name}
                </Button>
              </Link>
            </DialogClose>
          );
        })}

        <Separator className='my-2' orientation='horizontal' />

        {/* Action buttons section */}
        <Link href={'/dashboard/new-metric'}>
          <Button className='h-[35px] w-full gap-[8px] rounded-[12px]'>
            <Plus className='size-[16px]' />
            Create metric
          </Button>
        </Link>

        {/* Mobile-only API key button */}
        <ApiDialog
          className='w-full sm:hidden'
          projectid={projects?.[activeProject]?.id ?? ''}
        >
          <Button
            variant={'secondary'}
            className='h-[35px] w-full gap-[8px] rounded-[12px] hover:text-primary'
          >
            <Code className='size-4' />
            Api key
          </Button>
        </ApiDialog>

        {/* Documentation link */}
        <Link href={'/docs/getting-started/introduction'}>
          <Button
            className='h-[35px] w-full gap-[8px] rounded-[12px] text-muted-foreground hover:text-primary'
            variant='secondary'
          >
            <Book className='size-[16px]' />
            Documentation
          </Button>
        </Link>

        {/* Settings dialog */}
        <SettingDialog>
          <Button
            className='h-[35px] w-full gap-[8px] rounded-[12px] text-muted-foreground hover:text-primary'
            variant='secondary'
          >
            <Settings className='size-[16px]' />
            Settings
          </Button>
        </SettingDialog>

        {/* Logout button */}
        <Button
          className='h-[35px] w-full gap-[8px] rounded-[12px]'
          variant='destructiveOutline'
          onClick={handleLogout}
        >
          <LogOut className='size-[16px]' />
          Logout
        </Button>
      </DrawerContent>
    </Drawer>
  );
};
