import WebContainer from '@/components/website/containers/container';
import BentoUiSection from '@/components/website/sections/landing/bento';
import ShowcaseLandingSection from '@/components/website/sections/landing/showcase';

export default async function Home() {
  return (
    <WebContainer>
      <ShowcaseLandingSection type='default' />
      <BentoUiSection />
    </WebContainer>
  );
}
