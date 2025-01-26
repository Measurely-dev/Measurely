// Import required Next.js and component types/dependencies
import type { Metadata } from 'next';
import { Navbar } from '@/components/markdown/navbar';
import '../../styles/markdown.css';

// Define page metadata
export const metadata: Metadata = {
  title: 'Documentation',
};

// Root layout component that wraps children with navigation and container
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='markdown docs'>
      {/* Navigation bar component */}
      <Navbar />
      {/* Main content container with responsive width */}
      <div className='mx-auto h-auto w-[88vw] sm:container'>{children}</div>
    </div>
  );
}
