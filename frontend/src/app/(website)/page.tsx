import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento';
import ShowcaseLandingSection from '@/components/website/sections/showcase';
import { headers } from 'next/headers';
import Measurely from 'measurely-js';

export default function Home() {
  const is_authenticated = headers().get('is-authentificated');

  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    Measurely.init(process.env.NEXT_PUBLIC_MEASURELY_API_KEY ?? '');
    Measurely.capture('beff3986-f11f-4e19-93e0-7654604f1d3b', {
      value: 1,
    });
  }
  return (
    <WebContainer>
      <ShowcaseLandingSection />
      <BentoUiSection isAuthentificated={is_authenticated} />
    </WebContainer>
  );
}
