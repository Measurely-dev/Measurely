import Footer from '@/components/website/footer';
import Navbar from '@/components/website/navbar';
import { headers } from 'next/headers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const is_authentificated = headersList.get('is-authentificated');

  return (
    <div className='flex flex-col items-center overflow-x-hidden'>
      <Navbar type={is_authentificated === 'true' ? 'logged' : 'default'} />
      <div className='min-h-screen w-screen'>{children}</div>
      <Footer bg='default' border={false} />
    </div>
  );
}
