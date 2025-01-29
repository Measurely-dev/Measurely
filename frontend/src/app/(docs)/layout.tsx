/* NextJS layout component that provides the base structure for documentation pages.
 * This includes a navigation bar and a responsive container for content.
 */

import type { Metadata } from 'next';
import { Navbar } from '@/components/markdown/navbar';
import '../../styles/markdown.css';
import { headers } from 'next/headers';

/* Page metadata configuration */
export const metadata: Metadata = {
  title: 'Documentation',
};

/* Root layout component that wraps page content
 * @param children - Child components/content to be rendered within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Retrieve the 'is-authenticated' and 'x-request-pathname' values from the request headers.
  const is_authenticated = headers().get('is-authenticated') === 'true';
  return (
    <div className='markdown docs'>
      <Navbar type={is_authenticated ? 'logged' : 'waitlist'} />
      <div className='mx-auto h-auto w-[88vw] sm:container'>{children}</div>
    </div>
  );
}
