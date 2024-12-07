import { getDocsTocs } from '@/lib/markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import clsx from 'clsx';

export default async function Toc(props: { path: string }) {
  const tocs = await getDocsTocs(props.path);

  return (
    <div className='toc sticky top-16 hidden h-[95.95vh] min-w-[230px] flex-[1] py-8 lg:flex'>
      <div className='flex w-full flex-col gap-3 pl-2'>
        <h3 className='text-sm font-semibold'>On this page</h3>
        <ScrollArea className='pb-4 pt-0.5'>
          <div className='ml-0.5 flex flex-col gap-2.5 text-sm text-neutral-800 dark:text-neutral-300/85'>
            {tocs.map(({ href, level, text }) => (
              <Link
                key={href}
                href={href}
                className={clsx({
                  'pl-0': level == 2,
                  'pl-4': level == 3,
                  'pl-8': level == 4,
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
