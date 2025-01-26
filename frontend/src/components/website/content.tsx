import { ReactNode } from 'react';

export default function Content({
  children,
  className,
  type = 'default',
}: {
  children?: ReactNode;
  className?: string;
  type?: 'default' | 'page';
}) {
  return (
    <div
      className={`mx-auto flex w-[80vw] max-w-[1000px] flex-col max-lg:w-[95vw] ${className} ${type === 'page' ? 'py-[150px]' : ''}`}
    >
      {children}
    </div>
  );
}
