import { Rocket, Sparkle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useContext } from 'react';
import { UserContext } from '@/dash-context';
import PlansDialog from './plans-dialog';

export default function UpgradeCard() {
  const { user } = useContext(UserContext);
  function render() {
    switch (user?.plan) {
      case 'starter':
        return (
          <Card className='mt-5 rounded-[12px] rounded-b-none border-none bg-black'>
            <CardContent className='flex flex-row items-center justify-between gap-5 p-4 max-md:flex-col'>
              <div className='flex flex-col max-md:w-full'>
                <div className='flex flex-row items-center gap-3'>
                  <Rocket className='size-5 text-white' />
                  <div className='text-md font-semibold text-white'>
                    You're using the starter plan
                  </div>
                </div>
                <div className='text-sm text-secondary text-white/70'>
                  You can unlock your limits by upgrading to the next plan.
                </div>
              </div>
              <PlansDialog>
                <Button
                  className='rounded-[12px] !bg-background !text-primary hover:opacity-80 max-md:w-full'
                  variant={'default'}
                >
                  View plans
                </Button>
              </PlansDialog>
            </CardContent>
          </Card>
        );
      case 'plus':
        return (
          <Card className='mt-5 rounded-[12px] rounded-b-none border-none bg-black'>
            <CardContent className='flex flex-row items-center justify-between gap-5 p-4 max-md:flex-col'>
              <div className='flex flex-col max-md:w-full'>
                <div className='flex flex-row items-center gap-3'>
                  <div className='flex flex-row items-center gap-1 rounded-full bg-background px-2 py-0.5 text-xs'>
                    <Sparkle className='size-3 text-purple-500' />
                    <div className='animate-gradient bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text font-medium text-transparent'>
                      Plus
                    </div>
                  </div>
                  <div className='text-md font-semibold text-white'>
                    Welcome back,{' '}
                    <span className='font-semibold capitalize'>
                      {user?.firstname}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'pro':
        return (
          <Card className='mt-5 animate-gradient rounded-[12px] rounded-b-none border-none bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500'>
            <CardContent className='flex flex-row items-center justify-between gap-5 p-4 max-md:flex-col'>
              <div className='flex flex-col max-md:w-full'>
                <div className='flex flex-row items-center gap-3'>
                  <div className='flex flex-row items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium'>
                    <Sparkle className='size-3' />
                    Pro
                  </div>
                  <div className='text-md font-semibold text-white'>
                    Welcome back,{' '}
                    <span className='font-semibold capitalize'>
                      {user?.firstname}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card className='mt-5 animate-gradient rounded-[12px] rounded-b-none border-none bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500'>
            <CardContent className='flex flex-row items-center justify-between gap-5 p-4 max-md:flex-col'>
              <div className='flex flex-col max-md:w-full'>
                <div className='flex flex-row items-center gap-3'>
                  <div className='flex flex-row items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium'>
                    <Sparkle className='size-3' />
                    {user?.plan}
                  </div>
                  <div className='text-md font-semibold text-white'>
                    Welcome back,{' '}
                    <span className='font-semibold capitalize'>
                      {user?.firstname}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  }
  return render();
}
