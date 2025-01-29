// Import required dependencies
import NextLink from 'next/link';
import { ComponentProps } from 'react';

// Custom Link component that wraps Next.js Link with default styling and security attributes
// Takes same props as HTML anchor element through ComponentProps<'a'>
export default function Link({ href, ...props }: ComponentProps<'a'>) {
  // Return null if no href is provided
  if (!href) return null;

  // Render NextLink with:
  // - Passed href and props
  // - target="_blank" to open in new tab
  // - Security attributes (rel)
  // - Purple text styling
  return (
    <NextLink
      href={href}
      {...props}
      target='_blank'
      rel='noopener noreferrer'
      className='text-purple-500'
    />
  );
}
