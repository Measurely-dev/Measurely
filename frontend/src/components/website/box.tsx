import { ReactNode } from 'react';

export default function WebBox(props: {
  className?: string;
  title: string;
  icon: ReactNode;
  description: string;
}) {
  return (
    <div className='flex h-[350px] border shadow-sm shadow-black/5 flex-col items-center gap-[30px] rounded-[16px] bg-white px-[25px] py-5 pt-16'>
      <div className='flex size-[80px] items-center justify-center rounded-full border bg-accent/50'>
        {props.icon}
      </div>
      <div className='flex flex-col gap-5 text-center'>
        <div className='text-xl font-semibold'>{props.title}</div>
        <div className='text-base text-secondary'>{props.description}</div>
      </div>
    </div>
  );
}
