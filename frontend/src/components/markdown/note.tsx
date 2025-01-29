// Required imports for the Note component
import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

// Type definition for Note component props
type NoteProps = PropsWithChildren & {
  title?: string; // Optional title text
  type?: 'note' | 'danger' | 'warning' | 'success'; // Optional note type for different styles
};

// Note component for displaying highlighted information boxes
export default function Note({
  children,
  title = 'Note',
  type = 'note',
}: NoteProps) {
  // Generate Tailwind classes based on note type
  const noteClassNames = clsx({
    'dark:bg-neutral-900 bg-neutral-100': type == 'note',
    'dark:bg-red-950 bg-red-100 border-red-200 dark:border-red-900':
      type === 'danger',
    'dark:bg-orange-950 bg-orange-100 border-orange-200 dark:border-orange-900':
      type === 'warning',
    'dark:bg-green-950 bg-green-100 border-green-200 dark:border-green-900':
      type === 'success',
  });

  // Render note container with title and content
  return (
    <div
      className={cn(
        'my-3 flex flex-col gap-3 rounded-[12px] border px-3.5 py-2 tracking-wide',
        noteClassNames,
      )}
    >
      <div className='-mb-3 font-mono text-[1.05rem] font-medium'>{title}:</div>{' '}
      {children}
    </div>
  );
}
