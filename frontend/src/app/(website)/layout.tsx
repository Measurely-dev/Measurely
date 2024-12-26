import Footer from '@/components/website/footer';
import Navbar from '@/components/website/navbar';
import { headers } from 'next/headers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const is_authentificated = headers().get('is-authentificated');
  return (
    <div className='flex flex-col items-center overflow-x-hidden'>
      <Navbar type={is_authentificated === 'true' ? 'logged' : 'default'} />
      <div className='min-h-screen w-screen'>{children}</div>
      <Footer border={false} />
    </div>
  );
}
