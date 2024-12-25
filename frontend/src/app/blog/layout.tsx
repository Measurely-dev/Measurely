import Navbar from '@/components/website/navbar';
import Footer from '@/components/website/footer';
import { PropsWithChildren } from 'react';
import '../../styles/markdown.css';

export default function BlogLayout({ children }: PropsWithChildren) {
  return (
    <div className='blog flex flex-col items-center overflow-x-hidden'>
      <Navbar type={'default'} />
      <div className='min-h-screen w-screen'>{children}</div>
      <Footer bg='secondary' border={false} />
    </div>
  );
}
