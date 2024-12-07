import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Actions(props: {
  type: 'default' | 'waitlist' | 'logged';
}) {
  const render = () => {
    switch (props.type) {
      case 'default':
        return (
          <div className='flex flex-row gap-2 max-md:flex-col'>
            <Link href='/sign-in'>
              <Button
                variant='outline'
                size={'sm'}
                className='h-fit rounded-xl px-4 py-[10px] font-medium max-md:w-full'
              >
                Sign in
              </Button>
            </Link>
            <Link href='/register'>
              <Button
                variant='default'
                size={'sm'}
                className='h-full rounded-xl border-primary px-4 py-[10px] font-medium max-md:w-full'
              >
                Get started
              </Button>
            </Link>
          </div>
        );
      case 'logged':
        return (
          <div className='flex flex-row gap-2 max-md:w-full'>
            <Link href='/dashboard' className='max-md:w-full'>
              <Button
                variant='default'
                size={'sm'}
                className='h-full rounded-xl border-primary px-4 py-[10px] font-medium max-md:w-full'
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
