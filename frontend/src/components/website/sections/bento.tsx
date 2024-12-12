'use client';
import { useEffect, useState } from 'react';
import WebBentoBox from '../bento-box';
import WebBox from '../box';
import WebFooterHeader from '../footer-header';
import WebTitle from '../title';
import ContentContainer from '../content';
import { Gauge, LayoutGridIcon, SparklesIcon } from 'lucide-react';
import SubscriptionUiSection from './pricing';
import Image1 from '../../../../public/measurely-image1.png';
import Image2 from '../../../../public/measurely-image2.png';
import Image4 from '../../../../public/measurely-image4.png';
import Image5 from '../../../../public/measurely-image5.png';
export default function BentoUiSection() {
  const [is_client, set_is_client] = useState(false);
  const [window_width, set_window_width] = useState(0);

  useEffect(() => {
    set_is_client(true);
  }, []);

  useEffect(() => {
    if (is_client) {
      const handleResize = () => {
        set_window_width(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }
  }, [is_client]);

  const bentoBoxType = is_client
    ? window_width > 768
      ? 'horizontal-left'
      : 'vertical'
    : 'horizontal-left';

  return (
    <div className='z-10 w-screen bg-secondaryColor pb-[150px] pt-[150px]'>
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
            className='mt-5'
            title='Seamless Integration'
            description='Straightforward API integration that allows you to seamlessly start tracking your metrics in no time.'
            img={Image4}
          />
        </div>
        <WebBentoBox
          type={bentoBoxType}
          className='mt-5'
          title='Multiple metric type'
          description='Measurely tracks single (basic) and dual metrics. Basic metrics monitor growth, while dual metrics compare positive and negative influences on a key metric.'
          img={Image2}
        />
        <SubscriptionUiSection />
        <WebTitle
          subtitle='Metrics Simplified'
          className='mt-[145px]'
          title={`Measure What Matters with Measurely`}
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
        <WebFooterHeader className='mt-[170px]' />
      </ContentContainer>
    </div>
  );
}
