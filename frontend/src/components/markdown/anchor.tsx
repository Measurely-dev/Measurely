'use client';

// Import necessary dependencies for link handling and component typing
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentProps } from 'react';

// Define props interface extending Next.js Link props
type AnchorProps = ComponentProps<typeof Link> & {
  absolute?: boolean; // Match first path segment only instead of full path
  activeClassName?: string; // Class to apply when link is active
  disabled?: boolean; // Disable link functionality
};

// Custom Anchor component that extends Next.js Link with additional functionality
export default function Anchor({
  absolute,
  className = '',
  activeClassName = '',
  disabled,
  children,
  ...props
}: AnchorProps) {
  const path = usePathname();

  // Determine if current path matches link destination
  let isMatch = absolute
    ? props.href.toString().split('/')[1] == path.split('/')[1] // Match first path segment
    : path === props.href; // Match full path

  // External links are never considered active
  if (props.href.toString().includes('http')) isMatch = false;

  // Return disabled state if specified
  if (disabled)
    return (
      <div className={cn(className, 'cursor-not-allowed')}>{children}</div>
    );

  // Return enhanced Link component
  return (
    <Link className={cn(className, isMatch && activeClassName)} {...props}>
      {children}
    </Link>
  );
}
