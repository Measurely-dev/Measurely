import { ChevronRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function WebChip(props: {
  children: ReactNode;
  className?: string;
  color: 'default' | 'blue' | 'pink' | 'red' | 'teal' | 'yellow' | 'green';
  link?: boolean;
  href?: any;
}) {
  const colorVariants: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/50',
    red: 'text-red-500 bg-red-500/10 border-red-500/50',
    pink: 'text-pink-500 bg-pink-500/10 border-pink-500/50',
    teal: 'text-teal-500 bg-teal-500/10 border-teal-500/50',
    violet: 'text-violet-500 bg-violet-500/10 border-violet-500/75',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/75',
    green: 'text-green-500 bg-green-500/10 border-green-500/75',
    default: '',
  };
  return props.href ? (
    <Link href={props.href}>
      <div
        className={`line-clamp-1 flex w-fit flex-row items-center whitespace-nowrap rounded-full border bg-input/10 px-3 py-1 text-sm ${
          colorVariants[props.color]
        }`}
      >
        {props.children}
        <ChevronRightIcon />
      </div>
    </Link>
  ) : (
    <div
      className={`line-clamp-1 flex w-fit flex-row items-center justify-center whitespace-nowrap rounded-full border bg-input/10 px-3 py-1 text-sm ${
        colorVariants[props.color]
      }`}
    >
      {props.children}
    </div>
  );
}
