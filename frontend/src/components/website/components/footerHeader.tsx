import Link from 'next/link';
import WebButton from './button';

export default function WebFooterHeader(props: {
  className?: string;
  type: 'default' | 'waitlist';
}) {
  return (
    <div
      className={`flex flex-col items-center gap-[30px] text-center ${props.className}`}
    >
      <div className='text-6xl font-medium max-md:text-5xl max-sm:text-4xl'>
        Start managing <br />
        your clients here
      </div>
      <div className='text-2xl text-secondary max-md:text-xl max-sm:text-base'>
        Everything you need to build anything. Integrate Measurably
        <br /> in minutes. Get up and running fast.
      </div>
      <Link href='/waitlist'>
        <WebButton>
          {props.type === 'waitlist' ? 'Join waitlist for free' : 'Get started'}
        </WebButton>
      </Link>
    </div>
  );
}
