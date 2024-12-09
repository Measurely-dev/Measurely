import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import WebPageHeader from '@/components/website/page-header';

export default function Pricing() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <WebPageHeader
          title='Track what matters, grow with Measurely'
          description='Data drives decisions, but why is tracking it still so complicated?'
        />
        <div className='mx-auto mt-[150px] flex w-full max-w-[600px] flex-col'>
          <div className='text-4xl font-medium'>Our story</div>
          <div className='mt-5 text-lg'>
            We’re two 17-year-olds from Quebec, Canada, who share a passion for
            programming and innovation. In late 2022, we set out to tackle a
            problem we both faced: tracking and understanding data shouldn’t be
            complicated. That’s when Measurely was born.
          </div>
          <div className='mt-20 text-4xl font-medium'>Our mission</div>
          <div className='mt-5 text-lg'>
            Our mission is simple—make metrics tracking intuitive and powerful
            for everyone. From coding late into the night to fine-tuning every
            feature, Measurely is built with the dedication and curiosity of two
            programmers who believe in creating tools that truly help.
          </div>
          <div className='mt-20 text-lg'>
            We’re just getting started, and we’re excited to have you along for
            the journey!
          </div>
        </div>
      </ContentContainer>
    </WebContainer>
  );
}
