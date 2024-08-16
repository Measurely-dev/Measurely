import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Actions(props: {
  type: 'default' | 'waitlist' | 'logged';
}) {
  const render = () => {
    switch (props.type) {
      case 'default':
        return (
          <div className='flex flex-row gap-2'>
            <Link href='/sign-in'>
              <Button
                variant='outline'
                size={'sm'}
                className='h-fit rounded-xl px-4 py-[10px] font-medium'
              >
                Sign in
              </Button>
            </Link>
            <Link href='/register'>
              <Button
                variant='default'
                size={'sm'}
                className='h-full rounded-xl border-primary px-4 py-[10px] font-medium'
              >
                Get started
              </Button>
            </Link>
          </div>
        );
      case 'waitlist':
        return (
          <div className='flex flex-row gap-2'>
            <Link href='/sign-in'>
              <Button
                variant='outline'
                size={'sm'}
                className='h-fit rounded-xl px-4 py-[10px] font-medium'
              >
                Sign in
              </Button>
            </Link>
            <Link href='/waitlist'>
              <Button
                variant='default'
                size={'sm'}
                className='h-full rounded-xl border-primary px-4 py-[10px] font-medium'
              >
                Join waitlist
              </Button>
            </Link>
          </div>
        );
      case 'logged':
        return (
          <div className='flex flex-row gap-2'>
            <Link href='/dashboard'>
              <Button
                variant='default'
                size={'sm'}
                className='h-full rounded-xl border-primary px-4 py-[10px] font-medium'
              >
                Dashboard
              </Button>
            </Link>
          </div>
        );
    }
  };
  return render();
}
