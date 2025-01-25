import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import PricingCardsSection from '@/components/website/sections/pricing-page';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import WebFooterHeader from '@/components/website/footer-header';
import WebTitle from '@/components/website/title';
import {
  Accordion,
  AccordionItem,
  AccordionContent,
} from '@/components/ui/accordion';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { PricingQuestion } from '@/components/global/faq-questions';
import PricingComparasionSection from '@/components/website/sections/pricing-comparaison-section';

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
      <ContentContainer type='page' className='w-[90%] pt-[150px]'>
        <PricingCardsSection
          type='waitlist'
          isAuthentificated={is_authentificated}
        />
        <PricingComparasionSection />
        <div className='mt-[145px] pt-12'>
          <WebTitle subtitle='FAQ' title={`Frequently Asked Questions`} />
          <div className='mt-[70px] flex w-full items-start justify-center'>
            <div className='w-full'>
              <Accordion
                type='single'
                collapsible
                className='w-full -space-y-px rounded-[12px] shadow-sm shadow-black/5'
                defaultValue='3'
              >
                {PricingQuestion.map((item, i) => (
                  <AccordionItem
                    value={item.answer}
                    key={i}
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
        <WebFooterHeader type='waitlist' className='mt-[170px]' />
      </ContentContainer>
    </WebContainer>
  );
}
