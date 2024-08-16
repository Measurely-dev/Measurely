import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckIcon } from '@radix-ui/react-icons';

export default function Card4(props: { className?: string }) {
  return (
    <Card className={`w-[320px] rounded-2xl p-0 shadow-sm ${props.className}`}>
      <CardHeader className='flex flex-row items-center p-5'>
        <div className='flex w-full flex-col gap-1'>
          <span className='text-xs text-secondary'>
            • Created March 30, 2024
          </span>
          <span className='text-xl font-semibold'>Google Inc.</span>
        </div>
        <div className='flex aspect-square h-[40px] items-center justify-center rounded-full border border-green-400 bg-green-400/10 text-green-400'>
          <CheckIcon className='size-6' />
        </div>
      </CardHeader>
      <Separator className='w-full' />
      <CardContent className='flex flex-col p-5'>
        <span className='text-sm'>Project descripiton</span>
        <span className='mt-1 text-xs text-secondary'>
          Introducing our cutting-edge Client Portal Software, a revolutionary
          SaaS application designed specifically for modern Design and Creative
          Agencies. Streamline collaboration, enhance communication, and elevate
          project management to new heights.
        </span>
      </CardContent>
      <Separator className='w-full' />
      <CardFooter className='flex gap-2 p-5'>
        <Button size='sm'>Open</Button>
        <Button size='sm' variant='outline'>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
