// Import required components and dependencies
import { Suspense } from 'react';

// Root layout component that wraps the entire application
// Accepts children as a prop which represents nested route content
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Main container with flex column layout and hidden horizontal overflow
    <div className='flex flex-col items-center overflow-x-hidden'>
      {/* Suspense boundary for loading states */}
      <Suspense>
        {/* Content wrapper that takes full viewport height and width */}
        <div className='min-h-screen w-screen'>{children}</div>
      </Suspense>
    </div>
  );
}
