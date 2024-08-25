import { Separator } from '@/components/ui/separator';
import { ReactNode } from 'react';

export default function DashSeparator(props: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex w-full flex-row items-center gap-[10px] ${props.className}`}
    >
      <Separator className='w-auto flex-1' />
      <div className='text-sm text-secondary'>{props.children}</div>
      <Separator className='w-auto flex-1' />
    </div>
  );
}
