import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from 'react-feather';

export default function ProfileCard(props: {
  firstName: string;
  lastName: string;
  email: string;
  profileType: string;
  image: string | null;
  className?: string;
}) {
  return (
    <Card className={`flex flex-col gap-[10px] rounded-2xl border-none bg-accent p-5 ${props.className}`}>
      <div className='flex flex-col gap-[5px]'>
        <div className='text-base font-medium'>My profile</div>
        <div className='text-xs text-secondary'>
          This is how people in your team see’s you
        </div>
      </div>
      <div className='flex w-full flex-row items-center justify-between'>
        <div className='flex flex-row items-center gap-5'>
          <Avatar className='relative size-[65px] items-center justify-center overflow-visible'>
            <AvatarImage
              src={props.image ?? ""}
              className='rounded-full'
            />
            <AvatarFallback>
              <User className='size-1/2 text-secondary' />
            </AvatarFallback>
            <div className='absolute -bottom-2 rounded-full bg-accent p-0.5 px-1 text-[10px] font-medium'>
              {props.profileType}
            </div>
          </Avatar>
          <div className='flex flex-col gap-[2px]'>
            <div className='text-sm font-semibold'>
              {props.firstName} {props.lastName}
            </div>
            <div className='text-xs text-secondary'>{props.email}</div>
          </div>
        </div>
        <Button className='rounded-[12px]'>View Team</Button>
      </div>
    </Card>
  );
}
