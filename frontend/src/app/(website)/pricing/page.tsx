import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import PricingCardsSection from '@/components/website/sections/pricingPage';

export default function Pricing() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <PricingCardsSection />
      </ContentContainer>
    </WebContainer>
  );
}
