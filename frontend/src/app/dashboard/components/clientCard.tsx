import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ClientCard(props: {
  name: string;
  email: string;
  descirption: string;
  className?: string;
}) {
  return (
    <Card
      className={`flex flex-col gap-[10px] rounded-2xl border-none bg-accent p-5 ${props.className}`}
    >
      <div className='flex flex-col gap-[5px]'>
        <div className='text-base font-medium'>Client overview</div>
        <div className='text-xs text-secondary'>
          This is your client profile
        </div>
      </div>
      <div className='flex w-full flex-row items-center justify-between gap-10'>
        <div className='flex flex-row items-center gap-5'>
          <Avatar className='relative size-[65px] items-center justify-center overflow-visible'>
            <AvatarImage
              src='https://avatars.githubusercontent.com/u/115744911?v=4'
              className='rounded-full'
            />
          </Avatar>
          <div className='flex flex-col gap-[2px]'>
            <div className='flex items-center gap-[5px]'>
              <div className='text-sm font-semibold'>{props.name}</div>
              <Separator className='h-4 bg-input' orientation='vertical' />
              <div className='text-xs text-secondary'>{props.email}</div>
            </div>
            <div className='line-clamp-1 w-full text-xs text-secondary'>
              {props.descirption}
            </div>
          </div>
        </div>
        <Button className='rounded-[12px]'>View profile</Button>
      </div>
    </Card>
  );
}
