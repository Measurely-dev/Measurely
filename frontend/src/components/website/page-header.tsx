import { ReactNode } from 'react';

export default function PageHeader(props: {
  className?: string;
  title: string | ReactNode;
  description?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className={`flex flex-col gap-[25px] text-center ${props.className}`}>
      <div className='text-5xl font-medium leading-[58px]'>{props.title}</div>
      {props.description && (
        <div className={`text-sm ${props.descriptionClassName}`}>
          {props.description}
        </div>
      )}
    </div>
  );
}
