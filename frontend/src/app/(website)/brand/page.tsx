import { Button } from '@/components/ui/button';
import { CardContent, Card } from '@/components/ui/card';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import WebPageHeader from '@/components/website/page-header';
import { Download } from 'lucide-react';
import Image from 'next/image';
import MeasurelyIcon from '../../../../public/measurely-icon-1200x1200.png';
import MeasurelyLogo from '../../../../public/measurely-logo-816x306.png';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand',
  description:
    'Explore Measurely’s brand assets, including our logo, color palettes, and user guidelines. Whether you’re a partner, designer, or developer, find everything you need to represent Measurely consistently and professionally across your materials and projects.',
};
export default function BrandAssetsPage() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <WebPageHeader
          title='Brand'
          description='Guidelines and assets for presenting the Measurely brand consistently.'
        />
        {/* Logos Section */}
        <div className='mb-16 mt-[120px]'>
          <h2 className='mb-4 text-2xl font-medium'>Logos</h2>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {[
              {
                name: 'measurely-logo.png',
                src: MeasurelyLogo,
                width: 267,
                height: 100,
              },
              {
                name: 'measurely-icon.png',
                src: MeasurelyIcon,
                width: 100,
                height: 100,
              },
            ].map((logo, i) => (
              <Card key={i} className='border-none'>
                <CardContent className='p-0'>
                  <div className='mb-4 flex h-40 items-center justify-center rounded-[12px] bg-gray-100 p-4'>
                    <Image
                      src={logo.src}
                      alt={`${logo.name} preview`}
                      width={logo.width}
                      height={logo.height}
                      className='max-h-full max-w-full'
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>{logo.name}</span>
                    <a
                      href={`/${logo.name}`}
                      download={logo.name}
                      className='no-underline'
                    >
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
                <div
                  className={`h-20 rounded-[12px] border ${item.color}`}
                ></div>
                <span className='mt-2 text-sm font-medium'>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Section */}
        <div>
          <div className='space-y-4'>
            <div>
              {/* Usage Guidelines Section */}
              <div className='mt-12'>
                <h2 className='mb-4 text-2xl font-medium'>Usage Guidelines</h2>
                <Card className='border-none bg-accent'>
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
        </div>
      </ContentContainer>
    </WebContainer>
  );
}
