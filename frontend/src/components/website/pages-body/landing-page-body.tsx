'use client';

// Required imports for components and assets
import { ReactNode, useEffect, useState } from 'react';
import FooterHeader from '../footer-header';
import HeroTitle from '../hero-title';
import Content from '../content';
import { Gauge, LayoutGridIcon, SparklesIcon } from 'lucide-react';
import LandingPageBodyPricing from './landing-page-body-pricing';
import Image1 from '../../../../public/measurely-image1.png';
import Image2 from '../../../../public/measurely-image2.png';
import Image4 from '../../../../public/measurely-image4.png';
import Image5 from '../../../../public/measurely-image5.png';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { Question } from '@/components/global/faq-questions';
import Image, { StaticImageData } from 'next/image';

// Main Body component that handles the landing page layout
export default function Body() {
  // Track window width for responsive layout
  const [window_width, set_window_width] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      set_window_width(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine BentoBox layout based on screen width
  const bentoBoxType = window_width > 768 ? 'horizontal-left' : 'vertical';

  return (
    <div className='z-10 w-screen bg-background pb-[150px]'>
      <Content>
        {/* Hero Section */}
        <BentoBox
          type={bentoBoxType}
          title='Simplify Your Metrics'
          description='Measurely is your all-in-one solution for tracking and analyzing key metrics. With our API integration, monitor data in real-time and access detailed insights at your fingertips.'
          img={Image1}
        />

        {/* Feature Grid */}
        <div className='grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-2'>
          <BentoBox
            type='vertical'
            className='mt-5'
            title='Visualize Your Data, Your Way'
            description='Transform your data into clear, actionable charts with advanced customization options.'
            img={Image5}
          />
          <BentoBox
            type='vertical'
            className='mt-5 max-md:mt-0'
            title='Seamless Integration'
            description='Start tracking your metrics effortlessly with our straightforward API & SDKs setup.'
            img={Image4}
          />
        </div>

        {/* Additional Feature Section */}
        <BentoBox
          type={bentoBoxType}
          className='mt-5'
          title='Multiple Metric Types'
          description='Track both single and dual metrics. Single metrics monitor growth, while dual metrics capture positive and negative trends for deeper analysis.'
          img={Image2}
        />

        {/* Subscription Section */}
        <LandingPageBodyPricing />

        {/* Benefits Section */}
        <HeroTitle
          subtitle='Metrics Simplified'
          className='mt-[145px]'
          title='Focus on What Matters with Measurely'
        />

        {/* Feature Boxes */}
        <div className='mt-[70px] grid grid-cols-3 gap-[10px] max-md:grid-cols-1'>
          <Box
            icon={<Gauge className='size-10 stroke-[1] text-muted-foreground' />}
            title='Instant Insights'
            description='Gain real-time data insights for fast and informed decision-making.'
          />
          <Box
            icon={
              <SparklesIcon className='size-10 stroke-[1] text-muted-foreground' />
            }
            title='Custom Metrics'
            description='Tailor your tracking to suit unique business needs with flexible metric options.'
          />
          <Box
            icon={
              <LayoutGridIcon className='size-10 stroke-[1] text-muted-foreground' />
            }
            title='Effortless Integration'
            description='Connect easily with your current tools and workflows without hassle.'
          />
        </div>

        {/* FAQ Section */}
        <div className='mt-[145px] rounded-3xl bg-background pt-12'>
          <HeroTitle subtitle='FAQ' title='Frequently Asked Questions' />
          <div className='mt-[70px] flex w-full items-start justify-center'>
            <div className='w-full'>
              <Accordion
                type='single'
                collapsible
                className='w-full -space-y-px rounded-[12px] shadow-sm shadow-black/5'
                defaultValue='3'
              >
                {Question.map((item) => (
                  <AccordionItem
                    value={item.answer}
                    key={item.id}
                    className='border bg-background px-4 py-1 first:rounded-t-[12px] last:rounded-b-[12px]'
                  >
                    <AccordionPrimitive.Header className='flex'>
                      <AccordionPrimitive.Trigger className='flex flex-1 items-center gap-3 py-2 text-left text-[15px] font-semibold leading-6 transition-all [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&>svg]:-order-1 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0 [&[data-state=open]>svg]:rotate-180'>
                        {item.question}
                        <Plus
                          size={16}
                          strokeWidth={2}
                          className='shrink-0 opacity-60 transition-transform duration-200'
                          aria-hidden='true'
                        />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionContent className='pb-2 text-muted-foreground'>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Footer */}
        <FooterHeader className='mt-[170px]' type='waitlist' />
      </Content>
    </div>
  );
}

// BentoBox component for displaying feature sections with different layouts
function BentoBox(props: {
  className?: string;
  type: 'horizontal-left' | 'horizontal-right' | 'vertical';
  title: string;
  description: string;
  img: string | StaticImageData;
}) {
  const render = () => {
    switch (props.type) {
      case 'horizontal-left':
        return (
          <div
            className={`grid w-full grid-cols-[4fr,1fr] overflow-hidden rounded-[16px] border bg-background p-0 !pb-0 shadow-sm ${props.className}`}
          >
            <div className='flex h-full w-full flex-col justify-between p-[30px] pr-0'>
              <div className='text-xl font-semibold'>{props.title}</div>
              <div className='text-base font-normal text-muted-foreground'>
                {props.description}
              </div>
            </div>
            <div className='min-w-[400px]'>
              <Image
                src={props.img}
                draggable={false}
                alt='Image'
                width={400}
                height={1000}
              />
            </div>
          </div>
        );
      case 'horizontal-right':
        return (
          <div
            className={`grid w-full grid-cols-[1fr,4fr] overflow-hidden rounded-[16px] border bg-background p-0 !pb-0 shadow-sm ${props.className}`}
          >
            <div className='min-w-[400px]'>
              <Image
                src={props.img}
                alt='Image'
                draggable={false}
                width={400}
                height={1000}
              />
            </div>
            <div className='flex h-full w-full flex-col justify-between p-[30px] pl-0'>
              <div className='text-xl font-semibold'>{props.title}</div>
              <div className='text-base font-normal text-muted-foreground'>
                {props.description}
              </div>
            </div>
          </div>
        );
      case 'vertical':
        return (
          <div
            className={`grid w-full overflow-hidden rounded-[16px] border bg-background p-0 !pb-0 shadow-sm ${props.className}`}
          >
            <div className='flex h-fit w-full flex-col justify-between gap-8 p-[30px]'>
              <div className='text-xl font-semibold'>{props.title}</div>
              <div className='text-base font-normal text-muted-foreground'>
                {props.description}
              </div>
            </div>
            <div className='min-w-none mx-auto flex h-fit max-h-[500px] max-w-[450px] items-center justify-center'>
              <Image
                src={props.img}
                alt='Image'
                className='max-h-[500px]'
                draggable={false}
                height={340}
                width={1000}
              />
            </div>
          </div>
        );
    }
  };
  return render();
}

// Box component for displaying feature highlights with icons
function Box(props: {
  className?: string;
  title: string;
  icon: ReactNode;
  description: string;
}) {
  return (
    <div className='flex h-[350px] flex-col items-center gap-[30px] rounded-[16px] border bg-white px-[25px] py-5 pt-16 shadow-sm shadow-black/5'>
      <div className='flex size-[80px] items-center justify-center rounded-full border bg-accent/50'>
        {props.icon}
      </div>
      <div className='flex flex-col gap-5 text-center'>
        <div className='text-xl font-semibold'>{props.title}</div>
        <div className='text-base text-muted-foreground'>{props.description}</div>
      </div>
    </div>
  );
}
