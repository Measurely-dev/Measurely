import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import { ArrowRight, BookMarked } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help',
  description:
    'Find answers to your questions on the Measurely Help page. Access guides, tutorials, FAQs, and troubleshooting tips to get the most out of Measurely’s features and improve your experience with metric tracking and data analysis.',
};
export default function Help() {
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
    <WebContainer>
      <ContentContainer className='h-screen min-h-[600px]'>
        <Card className='mx-auto my-auto w-full max-w-[400px] !rounded-2xl border-none px-2 !pb-20 shadow-none'>
          <CardHeader className='!m-0 p-0'>
            <CardTitle className='text-2xl'>Legal</CardTitle>
          </CardHeader>
          <CardContent className='mt-5 flex w-full flex-col gap-2 !p-0'>
            {policy.map((policy, i) => {
              return (
                <Link
                  key={i}
                  href={policy.link}
                  className='group relative flex w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-xl border bg-accent px-4 py-2.5 pr-4 text-[15px] font-medium shadow-sm shadow-black/5 transition-all duration-200 hover:opacity-80'
                >
                  <BookMarked className='absolute -left-5 size-5 transition-all duration-200 group-hover:left-4' />
                  <div className='transition-all duration-200 group-hover:ml-7'>
                    {policy.name}
                  </div>
                  <ArrowRight className='size-5 text-black transition-all duration-200 group-hover:mr-1' />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </ContentContainer>
    </WebContainer>
  );
}
