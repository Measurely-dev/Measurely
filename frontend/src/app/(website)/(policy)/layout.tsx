import type { Metadata } from 'next';
import '../../../styles/markdown.css'
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
      <div className='min-h-screen w-screen'>{children}</div>
    </div>
  );
}
