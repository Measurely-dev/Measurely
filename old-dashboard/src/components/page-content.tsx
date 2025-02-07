import { ReactNode } from 'react';

/**
 * Content component that wraps children with standardized layout and spacing
 * @param children - Child elements to be rendered inside the container
 * @param className - Additional CSS classes to apply to the container
 * @param type - Layout type ('default' or 'page') that determines vertical padding
 */
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
      className={`mx-auto flex w-[80vw] max-w-[1000px] flex-col max-lg:w-[95vw] ${className} ${
        type === 'page' ? 'py-[150px]' : ''
      }`}
    >
      {children}
    </div>
  );
}