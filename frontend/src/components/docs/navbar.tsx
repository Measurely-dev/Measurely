import Link from 'next/link';
import Anchor from './anchor';
import { SheetLeftbar } from './leftbar';
import { page_routes } from '@/lib/routes-config';
import { Button } from '../ui/button';

export const NAVLINKS = [
  {
    title: 'Documentation',
    href: `/docs${page_routes[0].href}`,
  },
  {
    title: 'Community',
    href: 'https://discord.com',
  },
  {
    title: 'Support',
    href: '/help',
  },
];

export function Navbar() {
  return (
    <nav className='sticky top-0 z-50 h-16 w-full border-b border-accent/80 bg-opacity-5 backdrop-blur-xl backdrop-filter'>
      <div className='flex h-full items-center justify-between sm:container max-sm:px-3'>
        <div className='flex items-center gap-9'>
          <Link
            href='/home'
            className='flex flex-row items-center gap-2 font-semibold'
          >
            <svg
              className='size-8'
              xmlns='http://www.w3.org/2000/svg'
              xmlnsXlink='http://www.w3.org/1999/xlink'
              xmlSpace='preserve'
              version='1.1'
              viewBox='0 0 256 256'
            >
              <image xlinkHref='data:image/png;base64,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' />
            </svg>
            Measurely
          </Link>
          <div className='hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex'>
            {NAVLINKS.map((item) => {
              return (
                <Anchor
                  key={item.title + item.href}
                  activeClassName='text-primary font-semibold'
                  absolute
                  className='flex items-center gap-1'
                  href={item.href}
                >
                  {item.title}
                </Anchor>
              );
            })}
          </div>
        </div>
        <Link href={'/register'} className='max-md:hidden'>
          <Button className='rounded-[12px]'>Get started</Button>
        </Link>
        <SheetLeftbar />
      </div>
    </nav>
  );
}
