// Required imports for table of contents component
import { getDocsTocs } from '@/lib/markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import clsx from 'clsx';

// Table of Contents component that generates navigation links based on page headings
export default function Toc(props: { path: string }) {
  // Get table of contents data from markdown file at given path
  const tocs = getDocsTocs(props.path);

  return (
    // Sticky sidebar container for table of contents
    <div className='toc sticky top-16 hidden border-l pl-5 h-[95.95vh] min-w-[230px] flex-[1] py-8 lg:flex'>
      <div className='flex w-full flex-col gap-3 pl-2'>
        <h3 className='text-sm font-semibold'>On this page</h3>
        {/* Scrollable area for table of contents links */}
        <ScrollArea className='pb-4 pt-0.5'>
          <div className='ml-0.5 flex flex-col gap-2.5 text-sm text-neutral-800 dark:text-neutral-300/85'>
            {/* Map through TOC items and create links with appropriate indentation */}
            {tocs.map(({ href, level, text }) => (
              <Link
                key={href}
                href={href}
                className={clsx({
                  'pl-0': level == 2, // No padding for h2 headings
                  'pl-4': level == 3, // Indent h3 headings
                  'pl-8': level == 4, // Further indent h4 headings
                })}
              >
                {text}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
