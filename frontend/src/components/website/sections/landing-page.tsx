'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import WebButton from '../button';
import Image from 'next/image';
import Preview from '../../../../public/preview.png';
import { MoveRight } from 'lucide-react';
import BlurIn from '@/components/ui/blur-in';
import DotPattern from '@/components/ui/dot-pattern';
import { cn } from '@/lib/utils';

export default function LandingSection(props: {
  type: 'default' | 'waitlist';
}) {
  return (
    <>
      <DotPattern
        width={25}
        height={25}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          'opacity-80 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]',
        )}
      />
      <div className='relative flex h-screen min-h-[700px] w-screen flex-col items-center justify-between pt-[18vh] max-md:pt-[100px]'>
        <BlurIn
          duration={0.4}
          word={
            <Link
              href={'/blog/1'}
              className='group flex cursor-pointer select-none flex-row items-center gap-5 rounded-full border border-accent bg-accent p-1 pr-2 text-sm shadow-inner transition-all duration-200 hover:shadow-transparent max-sm:scale-90'
            >
              <div className='rounded-full border bg-background px-4 py-1.5'>
                Measurely <span className='ml-1 font-mono'>1.0</span>
              </div>
              <span className='flex w-[110px] flex-row items-center justify-between gap-2 pr-2 transition-all duration-200 group-hover:pr-1'>
                Learn more <MoveRight className='size-4' />
              </span>
            </Link>
          }
        />
        <div className='flex h-fit flex-col items-center justify-center gap-4'>
          <h1 className='mt-5 w-[90%] max-w-[900px] text-center text-6xl font-semibold leading-[1.15] tracking-normal max-lg:px-0 max-lg:text-5xl max-md:text-5xl'>
            <BlurIn
              duration={0.4}
              word={
                <span className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
                  Measurely
                </span>
              }
            />{' '}
            <BlurIn duration={0.4} word='All Your Metrics' />
            <BlurIn duration={0.4} word='in One Place.' />
          </h1>
          <BlurIn
            duration={0.4}
            word={
              props.type === 'waitlist' ? (
                <Link href='/waitlist'>
                  <WebButton className='group mt-5 px-3.5 py-2'>
                    <div className='duAll Your Metrics200 flex items-center gap-2 text-base transition-all group-hover:gap-3'>
                      Join waitlist
                    </div>
                  </WebButton>
                </Link>
              ) : (
                <Link href='/register'>
                  <WebButton className='group mt-5 px-3.5 py-2'>
                    <div className='flex items-center gap-2 text-base transition-all duration-200 group-hover:gap-3 max-sm:hidden'>
                      Start tracking for free
                    </div>
                    <div className='text-base sm:hidden'>Get started</div>
                  </WebButton>
                </Link>
              )
            }
          />
        </div>

        <div className='absolute left-[0] top-[0] z-[-10] h-[100%] w-screen bg-accent/40 backdrop-blur-2xl' />
        <div className='items-bottom justify-bottom relative mx-2 mt-20 flex h-fit w-fit max-w-[75%] select-none max-lg:mt-10 max-lg:max-w-[90%]'>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'anticipate' }}
            className='absolute top-2 z-[-11] h-[80%] w-[100%] animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 max-sm:h-[100%]'
          />
          <motion.div
            className='flex h-full w-full max-md:items-end'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Image
              src={Preview}
              alt='Preview image'
              height={1762}
              width={2762}
              className='relative z-10 mx-auto h-full w-fit rounded-2xl rounded-b-none bg-background object-contain p-2 px-1 pb-0 ring-4 ring-background/50 max-md:h-fit max-sm:ml-5 max-sm:w-[125vw] max-sm:min-w-[700px]'
              priority
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}
