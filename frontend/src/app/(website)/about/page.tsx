import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import WebPageHeader from '@/components/website/page-header';

export default function Pricing() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <div className='mx-auto flex w-full max-w-[600px] flex-col'>
          <div className='text-4xl font-medium'>Our story</div>
          <div className='mt-5 text-lg'>
            We’re two{' '}
            <span className='font-semibold text-blue-600'>17-year-olds</span>{' '}
            from Quebec, Canada, who share a passion for programming and
            innovation. In late 2022, we set out to tackle a problem we both
            faced: tracking and understanding data shouldn’t be complicated.
            That’s when{' '}
            <span className='font-semibold text-blue-600'>Measurely</span> was
            born.
          </div>
          <div className='mt-20 text-4xl font-medium'>Our mission</div>
          <div className='mt-5 text-lg'>
            Our mission is simple—make{' '}
            <span className='font-semibold text-blue-600'>
              metrics tracking
            </span>{' '}
            intuitive and powerful for everyone. From coding late into the night
            to fine-tuning every feature,{' '}
            <span className='font-semibold text-blue-600'>Measurely</span> is
            built with the dedication and curiosity of two programmers who
            believe in creating tools that truly help.
          </div>
          <div className='mt-20 text-4xl font-medium'>
            Why Measurely?
          </div>
          <div className='mt-5 text-lg'>
            The modern world runs on data, but not everyone has access to the
            tools to harness it. With{' '}
            <span className='font-semibold text-blue-600'>Measurely</span>, we
            aim to break down those barriers. Whether you’re a solo developer, a
            small team, or just someone curious about their numbers,{' '}
            <span className='font-semibold text-blue-600'>Measurely</span> is
            here to make metrics accessible and actionable.
          </div>
          <div className='mt-20 text-4xl font-medium'>What’s Next?</div>
          <div className='mt-5 text-lg'>
            We’re just getting started.{' '}
            <span className='font-semibold text-blue-600'>Measurely</span> is
            constantly evolving, and we have big plans for the future. From
            expanding features to building a community of data enthusiasts,
            we’re committed to growing{' '}
            <span className='font-semibold text-blue-600'>Measurely</span>
            into something extraordinary.
          </div>
          <div className='mt-20 text-4xl font-medium'>
            Join Us on Our Journey
          </div>
          <div className='mt-5 text-lg'>
            <span className='font-semibold text-blue-600'>Measurely</span> is
            more than just a platform—it’s a movement toward smarter, simpler
            data tracking. As we continue to grow and evolve, we want you to be
            part of that journey. Whether you're a developer, a business owner,
            or someone passionate about data,{' '}
            <span className='font-semibold text-blue-600'>Measurely</span> is
            built for you. Together, we can shape the future of data tracking.
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
