import Link from 'next/link';
import WebButton from './button';

export default function WebFooterHeader(props: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-[30px] text-center ${props.className}`}
    >
      <div className='text-6xl font-medium max-md:text-5xl max-sm:text-4xl'>
        Ready to elevate your app’s
        <br /> tracking methods?
      </div>
      <div className='text-2xl text-secondary max-md:text-xl max-sm:text-base'>
        Join the teams who trust Measurely for real-time
        <br /> insights and seamless integration.
      </div>
      <Link href='/register'>
        <WebButton>Get started</WebButton>
      </Link>
    </div>
  );
}
