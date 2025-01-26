import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Container from '@/components/website/container';
import Content from '@/components/website/content';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'react-feather';

// Define metadata for SEO and page headers
export const metadata: Metadata = {
  title: 'Help',
  description:
    'Find answers to your questions on the Measurely Help page. Access guides, tutorials, FAQs, and troubleshooting tips to get the most out of Measurely’s features and improve your experience with metric tracking and data analysis.',
};

// Main Help page component
export default function Help() {
  // Array of help options (currently only one option: Contact Us)
  const helpOptions = [
    {
      name: 'Contact Us',
      color: '', // Background color (empty for default)
      text: 'black', // Text color
      icon: (
        <div className='felx-row flex items-center gap-2 !text-[18px] font-medium text-primary'>
          Contact us
        </div>
      ),
      link: 'mailto:info@measurely.dev', // Link to contact via email
    },
  ];

  return (
    <Container>
      <Content className='h-screen min-h-[600px]'>
        {/* Card container for the help options */}
        <Card className='mx-auto my-auto w-full max-w-[400px] !rounded-2xl border-none px-2 !pb-20 shadow-none'>
          {/* Card header with the title */}
          <CardHeader className='!m-0 p-0'>
            <CardTitle className='text-2xl'>Need help?</CardTitle>
          </CardHeader>

          {/* Card content with the list of help options */}
          <CardContent className='mt-5 flex w-full flex-col gap-2 !p-0'>
            {helpOptions.map((help, i) => {
              return (
                <Link
                  key={i}
                  href={help.link}
                  className='group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-accent px-6 py-2.5 pr-4 shadow-sm shadow-black/5 transition-all duration-200 hover:opacity-80'
                  style={{ backgroundColor: help.color }}
                >
                  {/* Help option icon and text */}
                  {help.icon}

                  {/* Arrow icon for visual feedback */}
                  <ArrowUpRight
                    className='size-5 text-white transition-all duration-200 group-hover:mr-1'
                    style={{ color: help.text }}
                  />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </Content>
    </Container>
  );
}
