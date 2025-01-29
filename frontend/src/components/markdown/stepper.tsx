// Utility imports for class name handling and React children
import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { Children, PropsWithChildren } from 'react';

/**
 * Stepper component that renders a vertical list of numbered steps
 * Each step is rendered with a number indicator and a left border connecting the steps
 */
export function Stepper({ children }: PropsWithChildren) {
  // Get total number of child steps
  const length = Children.count(children);

  return (
    <div className='flex flex-col'>
      {Children.map(children, (child, index) => {
        return (
          <div
            className={cn(
              'relative ml-3 border-l pl-9',
              clsx({
                'pb-10': index < length - 1, // Add padding between steps except for last item
              }),
            )}
          >
            {/* Numbered indicator circle for each step */}
            <div className='font-code absolute -left-4 flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-xs font-medium'>
              {index + 1}
            </div>
            {child}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Individual step item component that displays a title and content
 * Used as a child of the Stepper component
 */
export function StepperItem({
  children,
  title,
}: PropsWithChildren & { title?: string }) {
  return (
    <div className='pt-0.5'>
      <div className='mb-3 mt-0 text-[18px] font-semibold text-primary'>
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
