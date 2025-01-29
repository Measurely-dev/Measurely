// Import required dependencies for pagination functionality
import { getPreviousNext } from '@/lib/markdown';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';

// Pagination component that displays previous/next navigation links
export default function Pagination({ pathname }: { pathname: string }) {
  // Get previous and next page data based on current pathname
  const res = getPreviousNext(pathname);

  return (
    // Two-column grid layout for pagination buttons
    <div className='grid flex-grow grid-cols-2 gap-3 py-7 sm:py-10'>
      {/* Previous page link container */}
      <div>
        {res.prev && (
          <Link
            className={buttonVariants({
              variant: 'outline',
              className:
                'flex w-full flex-col !items-start !py-8 pl-3 no-underline',
            })}
            href={`/docs${res.prev.href}`}
          >
            {/* Previous page label with chevron icon */}
            <span className='flex items-center text-xs text-muted-foreground'>
              <ChevronLeftIcon className='mr-1 h-[1rem] w-[1rem]' />
              Previous
            </span>
            {/* Previous page title */}
            <span className='ml-1 mt-1'>{res.prev.title}</span>
          </Link>
        )}
      </div>
      {/* Next page link container */}
      <div>
        {res.next && (
          <Link
            className={buttonVariants({
              variant: 'outline',
              className:
                'flex w-full flex-col !items-end !py-8 pr-3 no-underline',
            })}
            href={`/docs${res.next.href}`}
          >
            {/* Next page label with chevron icon */}
            <span className='flex items-center text-xs text-muted-foreground'>
              Next
              <ChevronRightIcon className='ml-1 h-[1rem] w-[1rem]' />
            </span>
            {/* Next page title */}
            <span className='mr-1 mt-1'>{res.next.title}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
