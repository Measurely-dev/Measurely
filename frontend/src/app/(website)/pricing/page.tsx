import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import PricingCardsSection from '@/components/website/sections/pricing-page';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import WebFooterHeader from '@/components/website/footer-header';
import WebTitle from '@/components/website/title';
import { Accordion, Content, Tab, Trigger } from '@/components/ui/accordion';
import { FAQQuestionPricing } from '@/components/global/faq-questions-pricing';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Explore Measurely’s flexible pricing plans designed to meet the needs of developers and teams. Whether you’re just getting started or managing large-scale projects, we have a plan to help you track metrics and analyze data with ease.',
};

export default function Pricing() {
  const headersList = headers();
  const is_authentificated = headersList.get('is-authentificated');
  return (
    <WebContainer className='w-full max-w-full'>
      <ContentContainer type='page' className='w-[90%] pt-[150px] max-w-[90%]'>
        <PricingCardsSection
          type='waitlist'
          isAuthentificated={is_authentificated}
        />
        <div className='mt-[145px] rounded-3xl bg-accent p-5 py-7 pt-12'>
          <WebTitle subtitle='FAQ' title={`Frequently Asked Questions`} />
          <div className='mt-[70px] flex w-full items-start justify-center'>
            <div className='w-full'>
              <Accordion>
                {FAQQuestionPricing.map((e, i) => {
                  return (
                    <Tab
                      key={i}
                      className='mb-3 rounded-[12px] bg-background p-2 px-4'
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
        <WebFooterHeader type='waitlist' className='mt-[170px]' />
      </ContentContainer>
    </WebContainer>
  );
}
