'use client';
import Link from 'next/link';
import WebButton from './button';
import LogoSvg from '@/components/global/logo-svg';
import { usePathname } from 'next/navigation';
import { footerData } from './footer-data';
import FooterLink from './footer-link';

export default function Footer(props: {
  border: boolean;
  bg?: 'default' | 'secondary';
}) {
  const pathname = usePathname();
  return (
    <footer
      className={`relative z-10 flex w-screen flex-col items-center justify-center border-t px-10 pb-10 pt-16 ${props.bg ? (props.bg === 'default' ? 'bg-background' : 'bg-secondaryColor') : pathname === '/' ? 'bg-background' : 'bg-secondaryColor'} ${props.border === true ? 'border-t' : ''} `}
    >
      <div className='max-md: grid w-full max-w-[1100px] grid-cols-5 flex-col-reverse max-md:flex'>
        <div className='z-10 col-span-4 mx-auto grid w-full grid-cols-4 max-sm:grid-cols-2'>
          {footerData.map((section, i) => {
            return (
              <div className='flex flex-col gap-5 text-sm max-sm:mb-8' key={i}>
                <div className='font-mono font-medium'>{section.title}</div>
                <div className='flex flex-col gap-3'>
                  {section.links.map((link, i) => {
                    return <FooterLink href={link.href} name={link.name} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className='flex w-full flex-col items-end gap-5 max-md:mb-10 max-md:items-start'>
          <div className='flex items-center gap-2 text-sm text-secondary'>
            <LogoSvg className='size-10' />
          </div>
        </div>
      </div>

      <div className='mt-24 flex w-full max-w-[1100px] items-center justify-between text-sm text-[#666666] max-md:mt-16 max-sm:mt-6'>
        <div>
          © 2024{' '}
          <span className='max-md:hidden'>
            Measurely-dev - All rights reserved.
          </span>
        </div>
        <WebButton>Get started</WebButton>
      </div>
    </footer>
  );
}
