// Import required components and dependencies
import { Button } from '@/components/ui/button';
import Container from '@/components/website/container';
import Body from '@/components/website/pages-body/landing-page-body';
import { MoveRight } from 'lucide-react';
import Measurely from 'measurely-js';
import Link from 'next/link';
import { ChevronRight } from 'react-feather';

// Home page component that handles analytics tracking and renders the landing page
export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Initialize analytics tracking in production environment
  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    // Determine traffic source from URL parameters
    let ref =
      searchParams?.['ref'] === undefined
        ? 'direct'
        : (searchParams['ref'] as string);

    // Valid traffic source references
    const refs = [
      'reddit',
      'twitter',
      'discord',
      'bluesky',
      'producthunt',
      'direct',
      'launchtory',
      'quora',
      'indiehackers',
    ];

    // Default to 'direct' if invalid ref
    if (!refs.includes(ref)) ref = 'direct';

    // Initialize Measurely analytics
    Measurely.init(process.env.NEXT_PUBLIC_MEASURELY_API_KEY ?? '');

    // Capture page view with traffic source
    const metricId = 'beff3986-f11f-4e19-93e0-7654604f1d3b';
    const payload = {
      value: 1,
      filters: {
        'traffic source': ref,
      },
    };

    Measurely.capture(metricId, payload);
  }

  return (
    <Container>
      <Landing type='waitlist' />
      <Body />
    </Container>
  );
}

// Landing component renders the main hero section
function Landing(props: { type: 'default' | 'waitlist' }) {
  return (
    <>
      <div className='flex h-[90vh] min-h-[550px] w-screen flex-col items-center justify-center gap-5 text-center max-md:h-fit max-md:min-h-[50vh] max-md:pb-[80px] max-md:pt-[120px]'>
        <Link
          href={'/blog/3'}
          className='group flex cursor-pointer select-none flex-row items-center gap-3 rounded-full border border-input bg-accent p-0.5 pr-1 text-sm shadow-sm shadow-black/5 transition-all duration-200 hover:shadow-black/10 max-sm:scale-90'
        >
          <div className='rounded-full border bg-background px-3 py-1'>
            <span className='font-mono'>Open Source</span>
          </div>
          <span className='flex w-[110px] flex-row items-center justify-between gap-2 pr-2 transition-all duration-200 group-hover:pr-1'>
            Learn more <MoveRight className='size-4' />
          </span>
        </Link>
        <h1 className='flex-col text-[4.3rem] font-medium leading-tight max-lg:text-[3rem] max-md:text-[2rem] max-sm:text-[1.8rem] md:inline-flex'>
          Track all your metrics <br />
          <span className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text text-transparent'>
            In one powerful platform
          </span>
        </h1>

        <div className='text-md w-[95%] flex-col font-medium max-md:text-sm max-sm:text-[13px] md:inline-flex'>
          <span>Measurely is an open source analytics platform.</span>
          <span>
            Start tracking with real-time metrics, API integrations,
            customizable
            <br className='max-md:hidden' /> blocks, data visualizations, and
            powerful team collaboration tools.
          </span>
        </div>
        <div className='mt-4 flex gap-2'>
          <Link href={props.type === 'waitlist' ? '/waitlist' : '/register'}>
            <Button className='rounded-[12px]'>
              {props.type === 'waitlist' ? 'Join wailist' : 'Start tracking'}
            </Button>
          </Link>
          <Link href={'/docs/getting-started/introduction'}>
            <Button variant={'outline'} className='rounded-[12px]'>
              Read docs
              <ChevronRight className='ml-2 size-4' />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
