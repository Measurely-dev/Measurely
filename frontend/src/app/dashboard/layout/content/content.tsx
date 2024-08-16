import { ScrollArea } from '@/components/ui/scroll-area';
import { ReactNode } from 'react';

export default function DashboardContent(props: { children: ReactNode }) {
  return (
    <ScrollArea className='relative flex h-screen w-full flex-col pt-[15px]'>
      {props.children}
    </ScrollArea>
  );
}
