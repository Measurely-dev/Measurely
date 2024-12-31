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
          title='Effortless metric tracking'
        />
        <WebBentoBox
          type={bentoBoxType}
          className='mt-20'
          title='Simplify Your Metrics'
          description='Measurely is a powerful tool that makes it easy to track and analyze your key metrics. With a simple API integration, you can send your data to Measurely for real-time monitoring and visualization.'
          img={Image1}
        />
        <div className='grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-2'>
          <WebBentoBox
            type='vertical'
            className='mt-5'
            title='Visualize Your Data, Your Way'
            description='Data is displayed in easy-to-understand charts & tables, with advanced options.'
            img={Image5}
          />
          <WebBentoBox
            type='vertical'
            className='mt-5 max-md:mt-0'
            title='Seamless Integration'
            description='Straightforward API integration that allows you to seamlessly start tracking your metrics in no time.'
            img={Image4}
          />
        </div>
        <WebBentoBox
          type={bentoBoxType}
          className='mt-5'
          title='Multiple metric types'
          description='Measurely tracks single (basic) and dual metrics. Basic metrics monitor growth, while dual metrics compare positive and negative influences on a key metric.'
          img={Image2}
        />
        <SubscriptionUiSection isAuthentificated={props.isAuthentificated} />
        <WebTitle
          subtitle='Metrics Simplified'
          className='mt-[145px]'
          title={`Focus on What Matters with Measurely`}
        />
        <div className='mt-[70px] grid grid-cols-3 gap-[10px] max-md:grid-cols-1'>
          <WebBox
            icon={<Gauge className='size-10 stroke-[1] text-secondary' />}
            title='Instant Insights'
            description='Access real-time data to make quick, informed decisions.'
          />
          <WebBox
            icon={
              <SparklesIcon className='size-10 stroke-[1] text-secondary' />
            }
            title='Custom Metrics'
            description='Tailor tracking to your unique needs for precise monitoring.'
          />
          <WebBox
            icon={
              <LayoutGridIcon className='size-10 stroke-[1] text-secondary' />
            }
            title='Effortless Integration'
            description='Seamlessly connect with your existing tools and workflows.'
          />
        </div>
        <div className='mt-[145px] rounded-3xl bg-background p-5 py-7 pt-12'>
          <WebTitle subtitle='FAQ' title={`Frequently Asked Questions`} />
          <div className='mt-[70px] flex w-full items-start justify-center'>
            <div className='w-full'>
              <Accordion>
                {FAQQuestions.map((e, i) => {
                  return (
                    <Tab
                      key={i}
                      className='mb-3 rounded-[12px] bg-accent p-2 px-4'
                    >
                      <Trigger className='text-md'>{e.question}</Trigger>
                      <Content>{e.answer}</Content>
                    </Tab>
                  );
                })}
              </Accordion>
            </div>
          </div>
        </div>
        <WebFooterHeader className='mt-[170px]' />
      </ContentContainer>
    </div>
  );
}
