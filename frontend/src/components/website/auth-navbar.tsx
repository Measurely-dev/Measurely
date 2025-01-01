import LogoSvg from '@/components/global/logo-svg';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function AuthNavbar(props: {
  button: string | null;
  isDashboard?: boolean | false;
  href?: any;
}) {
  return (
    <div className='absolute z-10 ml-[40px] mt-[40px] flex w-fit items-center gap-[30px] px-5 py-3 max-md:ml-[0px] max-md:mt-[20px] max-md:px-5'>
      <Link href={props.isDashboard ? '/home' : '/'}>
        <div className='flex cursor-pointer items-center gap-[10px]'>
          <LogoSvg className='size-8' />
          <div className='text-sm font-semibold max-md:hidden'>Measurely</div>
        </div>
      </Link>
      {props.button === null ? null : (
        <>
          <Separator className='h-5' orientation='vertical' />
          <Link href={`${props.href}`}>
            <Button className='rounded-full text-sm' variant='secondary'>
              {props.button}
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

export function AuthNavbarButton(props: {
  button: string;
  isDashboard?: boolean | false;
  onClick: () => void;
}) {
  return (
    <div className='absolute z-10 ml-[40px] mt-[40px] flex w-fit items-center gap-[30px] px-5 py-3 max-md:ml-[0px] max-md:mt-[20px] max-md:px-5'>
      <Link href={props.isDashboard ? '/home' : '/'}>
        <div className='flex cursor-pointer items-center gap-[10px]'>
          <LogoSvg className='size-8' />
          <div className='text-sm font-semibold max-md:hidden'>Measurely</div>
        </div>
      </Link>
      <Separator className='h-5' orientation='vertical' />
      <Button
        className='rounded-full text-sm'
        variant='secondary'
        onClick={props.onClick}
      >
        {props.button}
      </Button>
    </div>
  );
}
