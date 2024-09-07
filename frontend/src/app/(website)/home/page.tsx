import WebContainer from '@/components/website/containers/container';
import BentoUiSection from '@/components/website/sections/landing/bento';
import ShowcaseLandingSection from '@/components/website/sections/landing/showcase-landing';

export default async function Home() {
  return (
    <WebContainer>
      <ShowcaseLandingSection type='default' />
      <BentoUiSection type='default' />
    </WebContainer>
  );
}
