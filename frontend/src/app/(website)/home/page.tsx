import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento';
import ShowcaseLandingSection from '@/components/website/sections/showcase';

export default async function Home() {
  return (
    <WebContainer>
      <ShowcaseLandingSection type='default' />
      <BentoUiSection />
    </WebContainer>
  );
}
