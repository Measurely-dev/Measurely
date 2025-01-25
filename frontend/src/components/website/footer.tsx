'use client';
import LogoSvg from '@/components/global/logo-svg';
import { usePathname } from 'next/navigation';
import { footerData } from './footer-data';
import FooterLink from './footer-link';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function Footer(props: {
  border: boolean;
  bg?: 'default' | 'secondary';
  isHome?: boolean | false;
  type: 'default' | 'waitlist';
}) {
  const pathname = usePathname();
  return (
    <footer
      className={`relative z-10 flex w-screen flex-col items-center justify-center border-t px-10 pb-10 pt-16 ${props.bg ? (props.bg === 'default' ? 'bg-background' : 'bg-secondaryColor') : pathname === '/' || pathname === '/home/' ? 'bg-background' : 'bg-secondaryColor'} ${props.border === true ? 'border-t' : ''} `}
    >
      <div className='max-md: grid w-full max-w-[1100px] grid-cols-5 flex-col-reverse max-md:flex'>
        <div className='z-10 col-span-4 mx-auto grid w-full grid-cols-4 max-sm:grid-cols-2'>
          {footerData.map((section, i) => {
            return (
              <div className='flex flex-col gap-5 text-sm max-sm:mb-8' key={i}>
                <div className='font-mono font-medium'>{section.title}</div>
                <div className='flex flex-col gap-3'>
                  {section.links.map((link, i) => {
                    return (
                      <FooterLink href={link.href} name={link.name} key={i} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className='flex w-full flex-col items-end gap-5 max-md:mb-10 max-md:items-start'>
          <Link href={props.isHome ? '/home' : '/'}>
            <LogoSvg className='size-10' aria-hidden='true' />
            <span className='sr-only'>Go to homepage</span>
          </Link>
        </div>
      </div>

      <div className='mt-24 flex w-full max-w-[1100px] items-center justify-between text-sm text-[#666666] max-md:mt-16 max-sm:mt-6'>
        <div className='flex items-center gap-2'>
          <a
            target='_blank'
            href='https://x.com/getmeasurely'
            className='group relative mr-2 transition-all duration-500'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 93 92'
              fill='none'
            >
              <rect
                x='0.138672'
                width='91.5618'
                height='91.5618'
                rx='15'
                fill='black'
              />
              <path
                d='M50.7568 42.1716L69.3704 21H64.9596L48.7974 39.383L35.8887 21H21L40.5205 48.7983L21 71H25.4111L42.4788 51.5869L56.1113 71H71L50.7557 42.1716H50.7568ZM44.7152 49.0433L42.7374 46.2752L27.0005 24.2492H33.7756L46.4755 42.0249L48.4533 44.7929L64.9617 67.8986H58.1865L44.7152 49.0443V49.0433Z'
                fill='white'
              />
            </svg>
          </a>
          © 2025 <span className='max-md:hidden'>Measurely-dev</span>
        </div>
        {props.type === 'waitlist' ? (
          <Link href={'/waitlist'}>
            <Button className='rounded-[12px]'>Join waitlist</Button>
          </Link>
        ) : (
          <Link href={'/register'}>
            <Button className='rounded-[12px]'>Get started</Button>
          </Link>
        )}
      </div>
    </footer>
  );
}
