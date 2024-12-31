import type { Metadata } from 'next';
import { Navbar } from '@/components/markdown/navbar';
import '../../styles/markdown.css';

export const metadata: Metadata = {
  title: 'Documentation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='markdown docs'>
      <Navbar />
      <div className='mx-auto h-auto w-[88vw] sm:container'>{children}</div>
    </div>
  );
}
