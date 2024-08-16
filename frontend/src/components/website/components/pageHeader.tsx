import { ReactNode } from 'react';

export default function WebPageHeader(props: {
  className?: string;
  title: string | ReactNode;
  description: string;
}) {
  return (
    <div className={`flex flex-col gap-[25px] text-center ${props.className}`}>
      <div className='text-5xl font-medium leading-[58px]'>{props.title}</div>
      <div className='text-sm'>{props.description}</div>
    </div>
  );
}
