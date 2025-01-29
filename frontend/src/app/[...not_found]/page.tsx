// Import required components from the website components directory
import Container from '@/components/website/container';
import Content from '@/components/website/content';
import Footer from '@/components/website/footer';
// Import Next.js Link component for client-side navigation
import Link from 'next/link';

// NotFound component - Renders the 404 error page when a route is not found
export default function NotFound() {
  return (
    // Main container div with full width and column layout
    <div className='flex w-screen flex-col justify-center'>
      <Container>
        {/* Content wrapper with minimum full viewport height */}
        <Content className='min-h-screen'>
          {/* Centered content container with vertical spacing */}
          <div className='mx-auto my-auto flex flex-col gap-5'>
            {/* Link wrapper to redirect to home page */}
            <Link href='/'>
              {/* Responsive heading with hover effect and font scaling */}
              <h1 className='cursor-pointer text-5xl font-medium transition-all duration-200 hover:opacity-65 max-md:text-3xl max-sm:text-2xl'>
                404 Page Not Found
              </h1>
            </Link>
          </div>
        </Content>
      </Container>
      {/* Footer component with waitlist type and secondary background */}
      <Footer type='waitlist' bg='secondary' border={false} />
    </div>
  );
}
