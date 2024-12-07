import LogoSvg from '@/components/global/logoSvg';
import Link from 'next/link';
import Actions from './actions';
import Links from './links';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Menu } from 'react-feather';

export default function Navbar(props: {
  type: 'default' | 'logged' | 'waitlist';
}) {
  const links: any = [
    {
      name: 'Documentation',
      href: '/docs/getting-started/introduction',
    },
    {
      name: 'Pricing',
      href: '/pricing',
    },
  ];
  return (
    <div className='fixed top-5 z-50 flex items-center gap-6 rounded-[20px] border border-background bg-accent/75 px-3 py-2 pl-4 backdrop-blur-xl max-md:w-[80%] max-md:justify-between'>
      {/* Logo */}
      <Link href='/home'>
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
          <Menu className='mr-2 size-5' />
        </DrawerTrigger>
        <DrawerContent className='flex flex-col gap-2 px-10 py-10 !pt-0'>
          <div className='h-8 w-full' />
          <DrawerClose asChild>
            <Link
              href={'/home'}
              className='cursor-pointer rounded-[12px] bg-accent p-2 px-4 text-sm transition-all duration-300 hover:pl-6 hover:opacity-80'
            >
              Home
            </Link>
          </DrawerClose>
          {links.map((link: { name: string; href: string }, i: any) => {
            return (
              <DrawerClose asChild>
                <Link
                  href={link.href}
                  key={i}
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
