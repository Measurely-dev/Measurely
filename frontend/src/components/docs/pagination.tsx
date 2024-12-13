import { getPreviousNext } from '@/lib/markdown';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';

export default function Pagination({ pathname }: { pathname: string }) {
  const res = getPreviousNext(pathname);

  return (
    <div className='grid flex-grow grid-cols-2 gap-3 py-7 sm:py-10'>
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
            <span className='flex items-center text-xs text-muted-foreground'>
              <ChevronLeftIcon className='mr-1 h-[1rem] w-[1rem]' />
              Previous
            </span>
            <span className='ml-1 mt-1'>{res.prev.title}</span>
          </Link>
        )}
      </div>
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
            <span className='flex items-center text-xs text-muted-foreground'>
              Next
              <ChevronRightIcon className='ml-1 h-[1rem] w-[1rem]' />
            </span>
            <span className='mr-1 mt-1'>{res.next.title}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
