import { PropsWithChildren } from 'react';
import '../../../styles/markdown.css';

// BlogLayout component to wrap blog-related pages
export default function BlogLayout({ children }: PropsWithChildren) {
  return (
    // Main container for the blog layout
    <div className='blog flex flex-col items-center overflow-x-hidden'>
      {/* Inner container to ensure full screen height and width */}
      <div className='min-h-screen w-screen'>{children}</div>
    </div>
  );
}
