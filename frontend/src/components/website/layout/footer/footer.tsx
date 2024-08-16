import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import WebButton from '../../components/button';
import { footerData } from './footerData';
import FooterLink from './footerLink';

export default function Footer(props: {
  border: boolean;
  bg: 'default' | 'secondary';
  type: 'default' | 'waitlist';
}) {
  return (
    <footer
      className={`relative z-10 flex w-screen flex-col items-center justify-center px-24 pt-20 pb-10 
      ${props.bg === 'default' ? 'bg-background' : 'bg-secondaryColor'}
      ${props.border === true ? 'border-t' : ''}
      `}
    >
      <div className='z-10 flex w-full max-w-[1200px] flex-col'>
        <div className='grid w-full grid-cols-4 max-md:grid-cols-2 max-md:gap-10 max-sm:gap-6'>
          {footerData?.map((category, i) => {
            return (
              <div className='flex h-auto w-full flex-col gap-2' key={i}>
                <div className='mb-2 ml-2 text-sm font-semibold text-primary'>
                  {category.title}
                </div>
                {category.items?.map((link, i) => {
                  return (
                    <FooterLink key={i} href={link.href} name={link.title} />
                  );
                })}
              </div>
            );
          })}
        </div>
        <Separator className='my-16 max-md:my-10' />
        <div className='flex w-full justify-between max-md:flex-col'>
          <div className='flex min-h-full flex-col justify-between max-md:gap-5'>
            <div className='text-sm text-secondary'>
              © 2024 Measurably Canada Pty Ltd
            </div>
            <Link href='/waitlist'>
              <WebButton>
                {props.type === 'default' ? 'Get started' : 'Join waitlist'}
              </WebButton>
            </Link>
          </div>
          <Separator className='my-10 md:hidden' />
          <div className='flex flex-col gap-2'>
            <FooterLink href='/privacy' name='Privacy policy' />
            <FooterLink href='/' name='Terms of service' />
            <FooterLink href='/' name='End user agreement' />
          </div>
        </div>
      </div>
    </footer>
  );
}
