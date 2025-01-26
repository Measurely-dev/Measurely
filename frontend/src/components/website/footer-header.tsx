import Link from 'next/link';
import { Button } from '../ui/button';

// Component that renders the header section of the footer
// Contains CTA text and buttons for waitlist/registration
export default function FooterHeader(props: {
  className?: string; // Optional CSS classes to apply
  type: 'waitlist' | 'default'; // Determines which CTA button to show
}) {
  return (
    <div
      className={`flex flex-col items-center gap-[30px] text-center ${props.className}`}
    >
      {/* Main headline text */}
      <div className='text-6xl font-medium max-md:text-5xl max-sm:text-4xl'>
        Ready to elevate your app's
        <br /> tracking methods?
      </div>

      {/* Subheadline text */}
      <div className='text-2xl text-secondary max-md:text-xl max-sm:text-base'>
        Join the teams who trust Measurely for real-time
        <br /> insights and seamless integration.
      </div>

      {/* CTA buttons container */}
      <div className='mt-2 flex gap-2'>
        {/* Conditional rendering of primary CTA based on type prop */}
        {props.type === 'waitlist' ? (
          <Link href={'/waitlist'}>
            <Button className='rounded-[12px]'>Join waitlist</Button>
          </Link>
        ) : (
          <Link href={'/register'}>
            <Button className='rounded-[12px]'>Get started</Button>
          </Link>
        )}

        {/* Documentation link button */}
        <Link href={'/docs/getting-started/introduction'}>
          <Button variant={'outline'} className='rounded-[12px]'>
            Read docs
          </Button>
        </Link>
      </div>
    </div>
  );
}
