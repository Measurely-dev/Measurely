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
    <div className={`flex flex-col gap-4 text-center ${props.className}`}>
      {/* Title text with large font size */}
      <div className='text-4xl font-medium'>{props.title}</div>
      {/* Optional description text if provided */}
      {props.description && (
        <div className={`text-base text-muted-foreground font-medium ${props.descriptionClassName}`}>
          {props.description}
        </div>
      )}
    </div>
  );
}
