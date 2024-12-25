import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

type NoteProps = PropsWithChildren & {
  title?: string;
  type?: 'note' | 'danger' | 'warning' | 'success';
};

export default function Note({
  children,
  title = 'Note',
  type = 'note',
}: NoteProps) {
  const noteClassNames = clsx({
    'dark:bg-neutral-900 bg-neutral-100': type == 'note',
    'dark:bg-red-950 bg-red-100 border-red-200 dark:border-red-900':
      type === 'danger',
    'dark:bg-orange-950 bg-orange-100 border-orange-200 dark:border-orange-900':
      type === 'warning',
    'dark:bg-green-950 bg-green-100 border-green-200 dark:border-green-900':
      type === 'success',
  });

  return (
    <div
      className={cn(
        'my-3 flex flex-col gap-3 rounded-[12px] border px-3.5 py-2 tracking-wide',
        noteClassNames,
      )}
    >
      <p className='-mb-3 font-mono text-[1.05rem] font-medium'>{title}:</p>{' '}
      {children}
    </div>
  );
}
