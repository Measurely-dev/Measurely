import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento';
import ShowcaseLandingSection from '@/components/website/sections/showcase';
import { headers } from 'next/headers';

export default async function Home() {
  const headersList = headers();
  const is_authentificated = headersList.get('is-authentificated');
  return (
    <WebContainer>
      <ShowcaseLandingSection />
      <BentoUiSection isAuthentificated={is_authentificated} />
    </WebContainer>
  );
}
