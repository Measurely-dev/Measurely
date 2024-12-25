import Link from 'next/link';
import WebButton from '../button';
import WebChip from '../chip';
import Card1 from '../showcase/card-1';
import Card5 from '../showcase/card-5';
import Image from 'next/image';
import Preview from '../../../../public/preview.png';
export default function ShowcaseLandingSection() {
  return (
    <div className='relative flex h-screen min-h-[780px] w-screen flex-col items-center pt-[22vh] max-lg:pt-[20vh] max-md:pt-[15vh]'>
      <WebChip color='default' href='/docs/getting-started/introduction'>
        <span className='mr-1 font-medium'>Measurely</span> is the new way
      </WebChip>
      <div className='mt-5 w-[90%] text-center text-6xl font-semibold leading-[1.15] tracking-normal max-lg:px-0 max-lg:text-5xl max-md:text-5xl max-sm:text-4xl'>
        <span className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
          Measurely
        </span>{' '}
        tracks what matters,
        <br className='max-md:hidden' /> grow with confidence.
      </div>
      <Link href='/register'>
        <WebButton className='mt-8'>Get started</WebButton>
      </Link>
      <div className='absolute left-[0] top-[0] z-[-10] h-screen w-screen bg-accent/40 backdrop-blur-2xl' />
      <div className='relative mx-2 mt-12 flex h-full w-fit max-w-[90%] items-center justify-center max-lg:mt-10 max-sm:ml-40 max-sm:w-[120vw] max-sm:min-w-[450px] max-sm:max-w-[120vw]'>
        <div className='absolute top-2 z-[-11] h-[80%] w-[100%] animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400' />
        <Image
          src={Preview}
          alt='Preview image'
          className={`relative z-10 h-full w-fit rounded-xl rounded-b-none ring-4 ring-background/50 duration-1000`}
        />
      </div>

      <Card5 className='absolute -left-16 -top-8 rotate-[9deg] max-lg:hidden' />
      <Card1 className='absolute -right-16 -top-10 rotate-[-9deg] max-lg:hidden' />
      {/* <div className='absolute bottom-0 flex h-10 w-full max-w-[1200px] items-center justify-center'>
        <Card2 className='absolute -bottom-10 right-16 rotate-[7deg] max-xl:w-[300px] max-lg:translate-x-[-45%] max-lg:rotate-0 max-md:hidden' />
        <Card3 className='absolute bottom-[90px] max-xl:w-[320px] max-lg:hidden' />
        <Card4 className='absolute -bottom-10 left-16 rotate-[-7deg] max-xl:w-[300px] max-lg:right-[50%] max-lg:translate-x-[50%] max-lg:rotate-0 max-md:left-[50%] max-md:w-[350px] max-md:translate-x-[-50%]' />
      </div> */}
    </div>
  );
}
