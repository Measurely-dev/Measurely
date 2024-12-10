import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import PricingCardsSection from '@/components/website/sections/pricingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Explore Measurely’s flexible pricing plans designed to meet the needs of developers and teams. Whether you’re just getting started or managing large-scale projects, we have a plan to help you track metrics and analyze data with ease.',
}
export default function Pricing() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <PricingCardsSection />
      </ContentContainer>
    </WebContainer>
  );
}
