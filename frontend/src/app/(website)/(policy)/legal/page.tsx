// Import UI components and necessary dependencies
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Container from '@/components/website/container';
import Content from '@/components/website/content';
import { ArrowRight, BookMarked } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

// Define page metadata for SEO
export const metadata: Metadata = {
  title: 'Help',
  description:
    "Find answers to your questions on the Measurely Help page. Access guides, tutorials, FAQs, and troubleshooting tips to get the most out of Measurely's features and improve your experience with metric tracking and data analysis.",
};

// Help page component
export default function Help() {
  // Define legal policy links and their corresponding routes
  const policy = [
    {
      name: 'Privacy policy',
      link: '/privacy',
    },
    {
      name: 'Terms of service',
      link: '/terms',
    },
  ];

  return (
    <Container>
      {/* Main content wrapper with minimum height */}
      <Content className='h-screen min-h-[600px]'>
        {/* Card component for legal links */}
        <Card className='mx-auto my-auto w-full max-w-[400px] border-none px-2 !pb-20 shadow-none'>
          {/* Card header with title */}
          <CardHeader className='!m-0 p-0'>
            <CardTitle className='text-2xl'>Legal</CardTitle>
          </CardHeader>

          {/* Card content with policy links */}
          <CardContent className='mt-5 flex w-full flex-col gap-2 !p-0'>
            {/* Map through policy array to create links */}
            {policy.map((policy, i) => (
              <Link
                key={i}
                href={policy.link}
                className='group relative flex w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-xl border bg-accent px-4 py-2.5 pr-4 text-[15px] font-medium shadow-sm shadow-black/5 transition-all duration-200 hover:opacity-80'
              >
                {/* Animated bookmark icon */}
                <BookMarked className='absolute -left-5 size-5 transition-all duration-200 group-hover:left-4' />

                {/* Policy name with hover animation */}
                <div className='transition-all duration-200 group-hover:ml-7'>
                  {policy.name}
                </div>

                {/* Arrow icon with hover animation */}
                <ArrowRight className='size-5 text-black transition-all duration-200 group-hover:mr-1' />
              </Link>
            ))}
          </CardContent>
        </Card>
      </Content>
    </Container>
  );
}
