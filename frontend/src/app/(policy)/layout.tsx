import Footer from '@/components/website/footer';
import Navbar from '@/components/website/navbar';
import type { Metadata } from 'next';
import '../../styles/markdown.css';
export const metadata: Metadata = {
  title: 'Policy | Measurely',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='policy flex flex-col items-center overflow-x-hidden'>
      <Navbar type={'default'} />
      <div className='min-h-screen w-screen'>{children}</div>
      <Footer bg='secondary' border={false} />
    </div>
  );
}
