// Import required components and dependencies
import LogoSvg from '@/components/global/logo-svg';
import Link from 'next/link';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Menu } from 'react-feather';
import { Button } from '@/components/ui/button';

// Main navigation bar component that handles different authentication states
export default function Navbar(props: {
  type: 'default' | 'logged' | 'waitlist';
  isHome?: boolean | false;
}) {
  // Navigation links configuration
  const links: any = [
    {
      name: 'Docs',
      href: '/docs/getting-started/introduction',
    },
    {
      name: 'Blog',
      href: '/blog',
    },
    {
      name: 'Pricing',
      href: '/pricing',
    },
  ];

  return (
    <div className='fixed top-5 z-50 flex items-center gap-6 rounded-[20px] border border-background bg-accent/75 px-3 py-2 pl-4 backdrop-blur-xl max-md:w-[40%] max-md:justify-between max-sm:w-[60%]'>
      {/* Logo section with conditional home link */}
      <Link href='/'>
        <div className='size-8'>
          <LogoSvg />
        </div>
      </Link>

      {/* Desktop navigation links */}
      <div className='max-md:hidden'>
        <Links links={links} />
      </div>

      {/* Desktop authentication actions */}
      <div className='max-md:hidden'>
        <Actions type={props.type} />
      </div>

      {/* Mobile navigation drawer */}
      <Drawer>
        <DrawerTrigger className='md:hidden'>
          <Menu className='mr-2 size-5' aria-label='Menu' />
        </DrawerTrigger>
        <DrawerContent className='flex flex-col gap-2 px-10 py-10 !pt-0 max-sm:p-3'>
          <div className='h-8 w-full' />
          <DrawerClose asChild>
            <Link
              href={'/'}
              className='cursor-pointer rounded-[12px] bg-accent p-2 px-4 text-sm transition-all duration-300 hover:pl-6 hover:opacity-80'
            >
              Home
            </Link>
          </DrawerClose>
          {/* Mobile navigation links */}
          {links.map((link: { name: string; href: string }, i: any) => {
            return (
              <DrawerClose asChild key={i}>
                <Link
                  href={link.href}
                  className='cursor-pointer rounded-[12px] bg-accent p-2 px-4 text-sm transition-all duration-300 hover:pl-6 hover:opacity-80'
                >
                  {link.name}
                </Link>
              </DrawerClose>
            );
          })}
          {/* Mobile authentication actions */}
          <Actions type={props.type} />
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// Component to render authentication-specific action buttons
function Actions(props: { type: 'default' | 'waitlist' | 'logged' }) {
  const render = () => {
    switch (props.type) {
      // Default state - Sign in and Get started buttons
      case 'default':
        return (
          <div className='flex flex-row gap-2 max-md:flex-col'>
            <Link href='/sign-in'>
              <Button
                variant='outline'
                size={'sm'}
                className='h-fit rounded-xl px-4 py-[10px] font-medium max-md:w-full'
              >
                Sign in
              </Button>
            </Link>
            <Link href='/register'>
              <Button
                variant='default'
                size={'sm'}
                className='h-full rounded-xl border-primary px-4 py-[10px] font-medium max-md:w-full'
              >
                Get started
              </Button>
            </Link>
          </div>
        );
      // Logged in state - Dashboard button
      case 'logged':
        return (
          <div className='flex flex-row gap-2 max-md:w-full'>
            <Link href='/dashboard' className='max-md:w-full'>
              <Button
                variant='default'
                size={'sm'}
                className='h-full rounded-xl border-primary px-4 py-[10px] font-medium max-md:w-full'
              >
                Dashboard
              </Button>
            </Link>
          </div>
        );
      // Waitlist state - Sign in and Join waitlist buttons
      case 'waitlist':
        return (
          <div className='flex flex-row gap-2 max-md:flex-col'>
            <Link href='/sign-in'>
              <Button
                variant='outline'
                size={'sm'}
                className='h-fit rounded-xl px-4 py-[10px] font-medium max-md:w-full'
              >
                Sign in
              </Button>
            </Link>
            <Link href='/waitlist'>
              <Button
                variant='default'
                size={'sm'}
                className='h-full rounded-xl border-primary px-4 py-[10px] font-medium max-md:w-full'
              >
                Join waitlist
              </Button>
            </Link>
          </div>
        );
    }
  };
  return render();
}

// Component to render navigation links
function Links(props: { links: Array<any> }) {
  return (
    <div className='flex items-center gap-4'>
      {props.links?.map((link, i) => {
        return (
          <Link
            key={i}
            href={link.href}
            className='text-xs font-medium transition-all duration-200 hover:opacity-70'
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}
