import Footer from '@/components/website/footer';
import { Suspense } from 'react';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex flex-col items-center overflow-x-hidden'>
      <Suspense>
        <div className='min-h-screen w-screen'>{children}</div>
      </Suspense>
      <Footer bg='secondary' border={false} />
    </div>
  );
}
