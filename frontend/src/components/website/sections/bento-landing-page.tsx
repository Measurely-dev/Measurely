'use client';
import { useEffect, useState } from 'react';
import WebBentoBox from '../bento-box';
import WebBox from '../box';
import WebFooterHeader from '../footer-header';
import WebTitle from '../title';
import ContentContainer from '../content';
import { Gauge, LayoutGridIcon, SparklesIcon } from 'lucide-react';
import SubscriptionUiSection from './pricing-landing-page';
import Image1 from '../../../../public/measurely-image1.png';
import Image2 from '../../../../public/measurely-image2.png';
import Image4 from '../../../../public/measurely-image4.png';
import Image5 from '../../../../public/measurely-image5.png';
import { Accordion, Content, Tab, Trigger } from '@/components/ui/accordion';
import { FAQQuestions } from '@/components/global/faq-questions';
export default function BentoUiSection(props: {
  isAuthentificated: string | null;
  type: 'default' | 'waitlist';
}) {
  const [window_width, set_window_width] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      set_window_width(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bentoBoxType = window_width > 768 ? 'horizontal-left' : 'vertical';

  return (
    <div className='z-10 w-screen border-t bg-secondaryColor pb-[150px] pt-[150px]'>
      <ContentContainer>
        <WebTitle
          subtitle='Discover Measurely'
          title='Effortless Metric Tracking for All'
        />
        <WebBentoBox
          type={bentoBoxType}
          className='mt-20'
          title='Simplify Your Metrics'
          description='Measurely is your all-in-one solution for tracking and analyzing key metrics. With our API integration, monitor data in real-time and access detailed insights at your fingertips.'
          img={Image1}
        />
        <div className='grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-2'>
          <WebBentoBox
            type='vertical'
            className='mt-5'
            title='Visualize Your Data, Your Way'
            description='Transform your data into clear, actionable charts with advanced customization options.'
            img={Image5}
          />
          <WebBentoBox
            type='vertical'
            className='mt-5 max-md:mt-0'
            title='Seamless Integration'
            description='Start tracking your metrics effortlessly with our straightforward API & SDKs setup.'
            img={Image4}
          />
        </div>
        <WebBentoBox
          type={bentoBoxType}
          className='mt-5'
          title='Multiple Metric Types'
          description='Track both single and dual metrics. Single metrics monitor growth, while dual metrics capture positive and negative trends for deeper analysis.'
          img={Image2}
        />
        <SubscriptionUiSection
          type={props.type}
          isAuthentificated={props.isAuthentificated}
        />
        <WebTitle
          subtitle='Metrics Simplified'
          className='mt-[145px]'
          title='Focus on What Matters with Measurely'
        />
        <div className='mt-[70px] grid grid-cols-3 gap-[10px] max-md:grid-cols-1'>
          <WebBox
            icon={<Gauge className='size-10 stroke-[1] text-secondary' />}
            title='Instant Insights'
            description='Gain real-time data insights for fast and informed decision-making.'
          />
          <WebBox
            icon={
              <SparklesIcon className='size-10 stroke-[1] text-secondary' />
            }
            title='Custom Metrics'
            description='Tailor your tracking to suit unique business needs with flexible metric options.'
          />
          <WebBox
            icon={
              <LayoutGridIcon className='size-10 stroke-[1] text-secondary' />
            }
            title='Effortless Integration'
            description='Connect easily with your current tools and workflows without hassle.'
          />
        </div>
        <div className='mt-[145px] rounded-3xl bg-background p-5 py-7 pt-12'>
          <WebTitle subtitle='FAQ' title='Frequently Asked Questions' />
          <div className='mt-[70px] flex w-full items-start justify-center'>
            <div className='w-full'>
              <Accordion>
                {FAQQuestions.map((e, i) => (
                  <Tab
                    key={i}
                    className='mb-3 rounded-[12px] bg-accent p-2 px-4'
                  >
                    <Trigger className='text-md'>{e.question}</Trigger>
                    <Content>{e.answer}</Content>
                  </Tab>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
        <WebFooterHeader className='mt-[170px]' type='waitlist' />
      </ContentContainer>
    </div>
  );
}
