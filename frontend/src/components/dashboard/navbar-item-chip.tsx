import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { ReactNode } from 'react';
import { BookOpen } from 'react-feather';

export default function NavbarItemChip() {
  const itemList = [
    {
      label: 'Documentation',
      href: '/docs/getting-started/introduction',
      icon: <BookOpen className='size-[18px]' />,
    },
  ];
  return (
    <div className='flex w-[45px] min-w-[45px] flex-col gap-[6px] rounded-[16px] bg-accent p-1'>
      {itemList.map((item, i) => {
        return (
          <Item label={item.label} key={i} href={item.href}>
            {item.icon}
          </Item>
        );
      })}
    </div>
  );
}

function Item(props: { children: ReactNode; label: string; href: string }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Link href={props.href} target='_blank'>
            <div
              className={`flex items-center justify-center rounded-[12px] py-1.5 text-[20px] text-secondary transition-all duration-200 hover:bg-background hover:text-primary`}
            >
              {props.children}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side='right'
          sideOffset={8}
          className='rounded-[6px] border bg-accent p-1 px-2 text-xs font-medium text-primary'
        >
          {props.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
