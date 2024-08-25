import { ScrollArea } from '@/components/ui/scroll-area';
import { ReactNode } from 'react';

export default function DashboardContentContainer(props: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col pr-[15px] mt-5 pb-[15px] ${props.className}`}>
      {props.children}
    </div>
  );
}
