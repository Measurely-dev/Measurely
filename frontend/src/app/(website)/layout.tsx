import Footer from '@/components/website/footer';
import Navbar from '@/components/website/navbar';
import { headers } from 'next/headers';

/**
 * RootLayout component wraps the application with a Navbar at the top,
 * a Footer at the bottom, and renders children in between.
 * It adapts the Navbar and Footer behavior based on request headers.
 *
 * @param {object} props - Props containing the children elements to be rendered.
 * @param {React.ReactNode} props.children - The content to display within the layout.
 * @returns {JSX.Element} The rendered layout component.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Retrieve the 'is-authenticated' and 'x-request-pathname' values from the request headers.
  const is_authenticated = headers().get('is-authenticated');
  const pathname = headers().get('x-request-pathname');

  // Determine whether the current page is the home page or user is authenticated.
  const isHome = is_authenticated === 'true' || pathname === '/home';

  return (
    <div className='flex flex-col items-center overflow-x-hidden'>
      {/* Navbar component at the top of the page */}
      <Navbar isHome={isHome} type='waitlist' />

      {/* Main content area */}
      <div className='min-h-screen w-screen'>{children}</div>

      {/* Footer component at the bottom of the page */}
      <Footer border={false} bg='secondary' type='waitlist' isHome={isHome} />
    </div>
  );
}
