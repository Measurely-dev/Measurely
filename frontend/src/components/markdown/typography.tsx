/**
 * Imports React's PropsWithChildren type for component typing
 */
import { PropsWithChildren } from 'react';

/**
 * Typography component that wraps content with customized typographic styling
 * Uses Tailwind's prose classes for rich text formatting
 * 
 * Applies:
 * - Base prose styles with zinc color scheme
 * - Dark mode support with inverted colors
 * - Custom code block styling (font, background, borders)
 * - Custom image styling (rounded corners, borders)
 * - Custom heading margins and scroll behavior
 * - Responsive width constraints
 * 
 * @param children - React child elements to be wrapped with typography styles
 */
export function Typography({ children }: PropsWithChildren) {
  return (
    <div className='prose prose-zinc dark:prose-invert prose-code:font-normal prose-code:font-code dark:prose-code:bg-stone-900/25 prose-code:bg-stone-50 prose-pre:bg-background prose-headings:scroll-m-20 prose-code:text-sm prose-code:leading-6 dark:prose-code:text-white prose-code:text-stone-800 prose-code:p-[0.085rem] prose-code:rounded-md prose-code:border prose-img:rounded-md prose-img:border prose-code:before:content-none prose-code:after:content-none prose-code:px-1.5 prose-code:overflow-x-auto prose-img:my-3 prose-h2:my-4 prose-h2:mt-8 w-[85vw] !min-w-full !max-w-[500px] pt-2 sm:mx-auto sm:w-full'>
      {children}
    </div>
  );
}
