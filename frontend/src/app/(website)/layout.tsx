import Footer from '@/components/website/footer';
import Navbar from '@/components/website/navbar';
import { headers } from 'next/headers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const is_authenticated = headers().get('is-authenticated');
  const pathname = headers().get('x-request-pathname');

  return (
    <div className='flex flex-col items-center overflow-x-hidden'>
      <Navbar
        isHome={
          is_authenticated === 'true' || pathname === '/home' ? true : false
        }
        // type={
        //   is_authenticated === 'true' || pathname === '/home'
        //     ? 'logged'
        //     : 'default'
        // }
        type='waitlist'
      />
      <div className='min-h-screen w-screen'>{children}</div>
      <Footer
        border={false}
        bg='secondary'
        type='waitlist'
        isHome={
          is_authenticated === 'true' || pathname === '/home' ? true : false
        }
      />
    </div>
  );
}
