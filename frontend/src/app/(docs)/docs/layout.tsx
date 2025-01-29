// Import the Leftbar component used for documentation navigation
import { Leftbar } from '@/components/markdown/leftbar';

// Layout component for documentation pages that provides a left sidebar navigation
// and main content area structure
export default function DocsLayout({
  children, // Child components to be rendered in the main content area
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Container with flexbox layout to position sidebar and content side-by-side
    <div className='flex items-start'>
      {/* Left sidebar navigation component */}
      <Leftbar key='leftbar' />

      {/* Main content area that takes up remaining width with flex grow of 5.25 */}
      <div className='w-full flex-[5.25]'>{children}</div>
    </div>
  );
}
