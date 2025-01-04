import ShowcaseCursor from '@/components/website/cursor';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import Footer from '@/components/website/footer';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex w-screen flex-col justify-center'>
      <WebContainer>
        <ContentContainer className='min-h-screen'>
          <div className='mx-auto my-auto flex flex-col gap-5'>
            <Link href='/'>
              <div className='relative flex cursor-pointer items-center justify-center gap-2 font-mono text-5xl font-bold transition-all duration-200 hover:gap-5 hover:opacity-65 max-md:text-3xl max-sm:text-2xl'>
                404 Page Not Found <ArrowRight className='size-12' />
                <ShowcaseCursor
                  cursor={3}
                  className='!absolute -top-14 left-[-125px] max-lg:left-[-75px] max-sm:hidden'
                />
              </div>
            </Link>
          </div>
        </ContentContainer>
      </WebContainer>
      <Footer type='waitlist' bg='default' border={false} />
    </div>
  );
}
