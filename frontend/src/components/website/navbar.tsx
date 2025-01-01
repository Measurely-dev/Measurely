import LogoSvg from '@/components/global/logo-svg';
import Link from 'next/link';
import Actions from './navbar-actions';
import Links from './navbar-links';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Menu } from 'react-feather';

export default function Navbar(props: {
  type: 'default' | 'logged' | 'waitlist';
  isHome?: boolean | false;
}) {
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
      {/* Logo */}
      <Link href={props.isHome ? '/home' : '/'}>
        <div className='size-8'>
          <LogoSvg />
        </div>
      </Link>
      {/* Links */}
      <div className='max-md:hidden'>
        <Links links={links} />
      </div>
      <div className='max-md:hidden'>
        {/* Actions group */}
        <Actions type={props.type} />
      </div>
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
          {/* Actions group */}
          <Actions type={props.type} />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
