'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import WebButton from '../button';
import Image from 'next/image';
import Preview from '../../../../public/preview.png';
import { MoveRight } from 'lucide-react';

export default function LandingSection() {
  return (
    <div className='relative flex h-screen min-h-[780px] w-screen flex-col items-center pt-[18vh]'>
      <Link
        href={'/blog/1'}
        className='group flex cursor-pointer select-none flex-row bg-accent/40 items-center gap-5 rounded-full border border-accent p-1 pr-2 text-sm shadow-inner transition-all duration-200 hover:shadow-transparent max-sm:scale-90'
      >
        <div className='rounded-full border bg-background px-4 py-1.5'>
          Measurely <span className='font-mono ml-1'>1.0</span>
        </div>
        <span className='flex w-[110px] flex-row items-center justify-between gap-2 pr-2 transition-all duration-200 group-hover:pr-1'>
          Learn more <MoveRight className='size-4' />
        </span>
      </Link>
      <h1 className='mt-5 w-[90%] text-center text-6xl font-semibold leading-[1.15] tracking-normal max-lg:px-0 max-lg:text-5xl max-md:text-5xl max-sm:text-4xl'>
        <span className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
          Measurely
        </span>{' '}
        tracks what matters,
        <br className='max-md:hidden' /> grow with confidence.
      </h1>
      <Link href='/register'>
        <WebButton className='mt-8'>Get started</WebButton>
      </Link>
      <div className='absolute left-[0] top-[0] z-[-10] h-[100%] w-screen bg-accent/40 backdrop-blur-2xl' />
      <div className='relative mx-2 mt-20 flex h-full w-fit max-w-[90%] items-center justify-center max-lg:mt-10 max-sm:ml-40 max-sm:w-[120vw] max-sm:min-w-[450px] max-sm:max-w-[120vw]'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: 'anticipate' }}
          className='absolute top-2 z-[-11] h-[80%] w-[100%] animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 max-sm:h-[100%]'
        />
        <motion.div
          className='h-full w-full'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Image
            src={Preview}
            alt='Preview image'
            className={`relative z-10 h-full w-fit rounded-xl rounded-b-none bg-background p-2 px-1 pb-0 ring-4 ring-background/50 duration-1000`}
          />
        </motion.div>
      </div>
    </div>
  );
}
