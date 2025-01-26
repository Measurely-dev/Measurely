import Container from '@/components/website/container';
import Content from '@/components/website/content';
import { Metadata } from 'next';

// Define metadata for SEO and page headers
export const metadata: Metadata = {
  title: 'About us',
  description:
    'Get to know the team behind Measurely. Learn about our mission, values, and commitment to providing developers and teams with the tools they need to track metrics, analyze data, and make better data-driven decisions.',
};

// Main page component for the "About Us" section
export default function Pricing() {
  return (
    <Container>
      <Content type='page'>
        {/* Main content container with a max width of 600px */}
        <div className='mx-auto flex w-full max-w-[600px] flex-col'>
          {/* Section: Our Story */}
          <div className='text-4xl font-medium'>Our story</div>
          <div className='mt-5 text-lg'>
            We’re two{' '}
            <span className='font-semibold text-blue-600'>17-year-olds</span>{' '}
            from Quebec, Canada, who share a passion for programming and
            innovation. In 2024, we set out to tackle a problem we both faced:
            tracking and understanding data shouldn’t be complicated. That’s
            when <span className='font-semibold text-blue-600'>Measurely</span>{' '}
            was born.
          </div>

          {/* Section: Our Mission */}
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

          {/* Section: Why Measurely? */}
          <div className='mt-20 text-4xl font-medium'>Why Measurely?</div>
          <div className='mt-5 text-lg'>
            The modern world runs on data, but not everyone has access to the
            tools to harness it. With{' '}
            <span className='font-semibold text-blue-600'>Measurely</span>, we
            aim to break down those barriers. Whether you’re a solo developer, a
            small team, or just someone curious about their numbers,{' '}
            <span className='font-semibold text-blue-600'>Measurely</span> is
            here to make metrics accessible and actionable.
          </div>

          {/* Section: What’s Next? */}
          <div className='mt-20 text-4xl font-medium'>What’s Next?</div>
          <div className='mt-5 text-lg'>
            We’re just getting started.{' '}
            <span className='font-semibold text-blue-600'>Measurely</span> is
            constantly evolving, and we have big plans for the future. From
            expanding features to building a community of data enthusiasts,
            we’re committed to growing{' '}
            <span className='font-semibold text-blue-600'>Measurely</span> into
            something extraordinary.
          </div>

          {/* Section: Join Us on Our Journey */}
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

          {/* Closing statement */}
          <div className='mt-20 text-lg'>
            We’re just getting started, and we’re excited to have you along for
            the journey!
          </div>
        </div>
      </Content>
    </Container>
  );
}
