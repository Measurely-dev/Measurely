import WebContainer from '@/components/website/containers/container';
import ContentContainer from '@/components/website/containers/content';
import PricingCardsSection from '@/components/website/sections/pricing/pricingCards';

export default function Pricing() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <PricingCardsSection />
      </ContentContainer>
    </WebContainer>
  );
}
