import { PropsWithChildren } from 'react';

export function Typography({ children }: PropsWithChildren) {
  return (
    <div className='prose prose-zinc dark:prose-invert prose-code:font-code dark:prose-code:bg-neutral-900 dark:prose-pre:bg-neutral-900 prose-code:bg-neutral-100 prose-pre:bg-neutral-100 prose-headings:scroll-m-20 prose-code:text-sm prose-code:leading-6 dark:prose-code:text-white prose-code:text-neutral-800 prose-code:p-1 prose-code:rounded-md prose-pre:border prose-code:before:content-none prose-code:after:content-none prose-img:rounded-md prose-img:border w-[85vw] !min-w-full pt-2 sm:mx-auto sm:w-full'>
      {children}
    </div>
  );
}
