// Import necessary components and dependencies
import LogoSvg from '@/components/global/logo-svg';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// SemiNavbar component that renders a navigation bar with optional button
export default function SemiNavbar(props: {
  button: string | null; // Text for the optional button
  href?: any; // Link destination for the button
}) {
  return (
    <div className='absolute z-10 ml-[40px] mt-[40px] flex w-fit items-center gap-[30px] px-5 py-3 max-md:ml-[0px] max-md:mt-[20px] max-md:px-5'>
      {/* Logo and brand name link */}
      <Link href='/'>
        <div className='flex cursor-pointer items-center gap-[10px]'>
          <LogoSvg className='size-8' />
          <div className='text-sm font-semibold max-md:hidden'>Measurely</div>
        </div>
      </Link>
      {/* Conditional rendering of button with separator */}
      {props.button === null ? null : (
        <>
          <Separator className='h-5' orientation='vertical' />
          <Link href={`${props.href}`}>
            <Button className='rounded-[12px] text-sm' variant='secondary'>
              {props.button}
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

// AuthNavbarButton component - Similar to SemiNavbar but with onClick handler instead of href
export function AuthNavbarButton(props: {
  button: string; // Text for the button
  isDashboard?: boolean | false; // Flag to determine home link destination
  onClick: () => void; // Click handler for the button
}) {
  return (
    <div className='absolute z-10 ml-[40px] mt-[40px] flex w-fit items-center gap-[30px] px-5 py-3 max-md:ml-[0px] max-md:mt-[20px] max-md:px-5'>
      {/* Logo and brand name link */}
      <Link href='/'>
        <div className='flex cursor-pointer items-center gap-[10px]'>
          <LogoSvg className='size-8' />
          <div className='text-sm font-semibold max-md:hidden'>Measurely</div>
        </div>
      </Link>
      <Separator className='h-5' orientation='vertical' />
      <Button
        className='rounded-[12px] text-sm'
        variant='secondary'
        onClick={props.onClick}
      >
        {props.button}
      </Button>
    </div>
  );
}
