import { PropsWithChildren } from 'react';
import '../../../styles/markdown.css';

export default function BlogLayout({ children }: PropsWithChildren) {
  return (
    <div className='blog flex flex-col items-center overflow-x-hidden'>
      <div className='min-h-screen w-screen'>{children}</div>
    </div>
  );
}
