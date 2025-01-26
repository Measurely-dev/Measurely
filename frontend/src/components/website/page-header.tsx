import { ReactNode } from 'react';

// PageHeader component displays a page title and optional description
export default function PageHeader(props: {
  className?: string;
  title: string | ReactNode;
  description?: string;
  descriptionClassName?: string;
}) {
  return (
    // Container div with flex column layout and center alignment
    <div className={`flex flex-col gap-[25px] text-center ${props.className}`}>
      {/* Title text with large font size */}
      <div className='text-5xl font-medium leading-[58px]'>{props.title}</div>
      {/* Optional description text if provided */}
      {props.description && (
        <div className={`text-sm ${props.descriptionClassName}`}>
          {props.description}
        </div>
      )}
    </div>
  );
}
