import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento-landing-page';
import Landing from '@/components/website/sections/landing-page';
import { headers } from 'next/headers';

export default function Home() {
  const is_authenticated = headers().get('is-authentificated');

  return (
    <WebContainer>
      <Landing type='default' />
      <BentoUiSection type='default' isAuthentificated={is_authenticated} />
    </WebContainer>
  );
}
