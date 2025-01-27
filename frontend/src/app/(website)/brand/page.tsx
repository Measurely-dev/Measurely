'use client';

import { BrandAssetsQuestions } from '@/components/global/faq-questions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Container from '@/components/website/container';
import Content from '@/components/website/content';
import PageHeader from '@/components/website/page-header';
import { Download, Plus } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import HeroTitle from '@/components/website/hero-title';

// BrandAssetsPage component for displaying brand assets and guidelines
export default function BrandAssetsPage() {
  // Update the document title and meta description on component mount
  useEffect(() => {
    document.title = 'Brand | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Explore Measurely’s brand assets, including our logo, color palettes, and user guidelines. Whether you’re a partner, designer, or developer, find everything you need to represent Measurely consistently and professionally across your materials and projects.',
      );
    }
  }, []);

  return (
    <Container>
      <Content type='page'>
        {/* Page header with gradient text */}
        <PageHeader
          title="Brand assets available for your use"
          description='Guidelines and assets for presenting the Measurely brand consistently.'
          descriptionClassName=' text-base text-primary max-w-[800px] mx-auto'
        />
        {/* Logos Section */}
        <div className='mb-16 mt-10'>
          <h2 className='mb-4 text-2xl font-medium'>Logos</h2>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {[
              {
                name: 'measurely-logo.png',
                src: '/logos/measurely-logo.png',
                width: 267,
                height: 100,
              },
              {
                name: 'measurely-icon.png',
                src: '/logos/measurely-icon.png',
                width: 100,
                height: 100,
              },
            ].map((logo, i) => (
              <Card key={i} className='border-none shadow-none'>
                <CardContent className='p-0'>
                  {/* Logo preview */}
                  <div className='mb-4 flex h-40 items-center justify-center rounded-[12px] border bg-accent p-4 shadow-sm shadow-black/5'>
                    <Image
                      src={logo.src}
                      alt={`${logo.name} preview`}
                      width={logo.width}
                      height={logo.height}
                      className='max-h-full max-w-full'
                    />
                  </div>

                  {/* Logo name and download button */}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>{logo.name}</span>
                    <a href={logo.src} download={logo.name}>
                      <Button
                        variant='outline'
                        className='rounded-[12px]'
                        size='sm'
                      >
                        <Download className='mr-2 h-4 w-4' />
                        Download
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Color Palette Section */}
        <div className='mb-12'>
          <h2 className='mb-4 text-2xl font-medium'>Color Palette</h2>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
            {[
              { name: 'Primary', color: 'bg-black' },
              { name: 'Secondary', color: 'bg-secondary' },
              { name: 'Accent', color: 'bg-accent' },
              { name: 'Background', color: 'bg-background' },
              { name: 'Text', color: 'bg-primary' },
              { name: 'Border', color: 'bg-input' },
            ].map((item) => (
              <div key={item.name} className='flex flex-col'>
                {/* Color swatch */}
                <div
                  className={`h-20 rounded-[12px] border shadow-sm shadow-black/5 ${item.color}`}
                ></div>
                <span className='mt-2 text-sm font-medium'>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Guidelines Section */}
        <div>
          <div className='space-y-4'>
            <div>
              <div className='mt-12'>
                <h2 className='mb-4 text-2xl font-medium'>Usage Guidelines</h2>
                <Card className='bg-accent'>
                  <CardContent className='p-4'>
                    <ul className='list-disc space-y-2 pl-6'>
                      <li>
                        Always use the official Measurely logos provided above.
                      </li>
                      <li>
                        Maintain the aspect ratio of the logos when resizing.
                      </li>
                      <li>
                        Use the color palette consistently across all materials.
                      </li>
                      <li>
                        Ensure proper contrast when using the logo on colored
                        backgrounds.
                      </li>
                      <li>
                        When in doubt, refer to these brand guidelines or
                        contact the design team.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className='mt-[70px] pt-12'>
            {/* HeroTitle component for the FAQ section */}
            <HeroTitle subtitle='FAQ' title='Frequently Asked Questions' />

            {/* Accordion for displaying FAQs */}
            <div className='mt-[70px] flex w-full items-start justify-center'>
              <div className='w-full'>
                <Accordion
                  type='single'
                  collapsible
                  className='w-full -space-y-px rounded-[12px] shadow-sm shadow-black/5'
                  defaultValue='3'
                >
                  {/* Map through PricingQuestion array to render each FAQ item */}
                  {BrandAssetsQuestions.map((item, i) => (
                    <AccordionItem
                      value={item.answer}
                      key={i}
                      className='border bg-background px-4 py-1 first:rounded-t-[12px] last:rounded-b-[12px]'
                    >
                      {/* Accordion header with the question */}
                      <AccordionPrimitive.Header className='flex'>
                        <AccordionPrimitive.Trigger className='flex flex-1 items-center gap-3 py-2 text-left text-[15px] font-semibold leading-6 transition-all [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&>svg]:-order-1 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0 [&[data-state=open]>svg]:rotate-180'>
                          {item.question}
                          {/* Plus icon for expanding/collapsing the FAQ item */}
                          <Plus
                            size={16}
                            strokeWidth={2}
                            className='shrink-0 opacity-60 transition-transform duration-200'
                            aria-hidden='true'
                          />
                        </AccordionPrimitive.Trigger>
                      </AccordionPrimitive.Header>

                      {/* Accordion content with the answer */}
                      <AccordionContent className='pb-2 text-muted-foreground'>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Container>
  );
}
