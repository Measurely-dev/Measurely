import Link from 'next/link';
import WebButton from './button';
import { footerData } from './footer-data';
import FooterLink from './footer-link';
import LogoSvg from '@/components/global/logo-svg';

export default function Footer(props: {
  border: boolean;
  bg: 'default' | 'secondary';
}) {
  return (
    <footer
      className={`relative z-10 flex w-screen flex-col items-center justify-center border-t px-10 pb-10 pt-10 ${props.bg === 'default' ? 'bg-background' : 'bg-secondaryColor'} ${props.border === true ? 'border-t' : ''} `}
    >
      <div className='z-10 flex w-full max-w-[1100px] flex-col gap-8'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-2 text-sm text-secondary'>
            <LogoSvg className='size-10' />© 2024
          </div>
          <Link href='/register'>
            <WebButton>Get started</WebButton>
          </Link>{' '}
        </div>
        <div className='flex w-full justify-between max-md:grid max-md:grid-cols-2 max-md:gap-5'>
          {footerData.map((link, i) => {
            return <FooterLink href={link.href} key={i} name={link.title} />;
          })}
        </div>
      </div>
    </footer>
  );
}
