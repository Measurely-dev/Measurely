'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import WebButton from '../button';
import WebChip from '../chip';
import Card1 from '../showcase/card-1';
import Card2 from '../showcase/card-2';
import Image from 'next/image';
import Preview from '../../../../public/preview.png';

export default function ShowcaseLandingSection() {
  return (
    <div className='relative flex h-screen min-h-[780px] w-screen flex-col items-center pt-[22vh] max-lg:pt-[20vh] max-md:pt-[15vh]'>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <WebChip color='default' href='/blog/1'>
          <span className='mr-1.5 font-medium'>Measurely</span>
          <span className='mr-1.5 animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono font-medium text-transparent'>
            1.0
          </span>
          is finally here
        </WebChip>
      </motion.div>

      <motion.h1
        className='mt-5 w-[90%] text-center text-6xl font-semibold leading-[1.15] tracking-normal max-lg:px-0 max-lg:text-5xl max-md:text-5xl max-sm:text-4xl'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
      >
        <span className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
          Measurely
        </span>{' '}
        tracks what matters,
        <br className='max-md:hidden' /> grow with confidence.
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3, ease: 'easeOut' }}
      >
        <Link href='/register'>
          <WebButton className='mt-8'>Get started</WebButton>
        </Link>
      </motion.div>

      <div className='absolute left-[0] top-[0] z-[-10] h-[100%] w-screen bg-accent/40 backdrop-blur-2xl' />

      <div className='relative mx-2 mt-12 flex h-full w-fit max-w-[90%] items-center justify-center max-lg:mt-10 max-sm:ml-40 max-sm:w-[120vw] max-sm:min-w-[450px] max-sm:max-w-[120vw]'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1, ease: 'anticipate' }}
          className='absolute top-2 z-[-11] h-[80%] w-[100%] animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 max-sm:h-[100%]'
        />
        <motion.div
          className='h-full w-full'
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <Image
            src={Preview}
            alt='Preview image'
            className={`relative z-10 h-full w-fit rounded-xl rounded-b-none bg-background p-2 px-1 pb-0 ring-4 ring-background/50 duration-1000`}
          />
        </motion.div>
      </div>

      <motion.div
        className='absolute -left-16 -top-8 max-lg:hidden'
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
      >
        <Card2 className='rotate-[9deg]' />
      </motion.div>

      <motion.div
        className='absolute -right-16 -top-7 max-lg:hidden'
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
      >
        <Card1/>
      </motion.div>
    </div>
  );
}
