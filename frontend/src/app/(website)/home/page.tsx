import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento';
import ShowcaseLandingSection from '@/components/website/sections/showcase';
import { headers } from 'next/headers';

export default async function Home() {
  const headersList = headers();
  const is_authentificated = headersList.get('is-authentificated');

  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    fetch(
      `https://api.measurely.dev/event/${process.env.NEXT_PUBLIC_MEASURELY_API_KEY}/29bee8ac-b93a-4aa3-805f-0c16c092808f`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: 1 }),
      },
    );
  }

  return (
    <WebContainer>
      <ShowcaseLandingSection />
      <BentoUiSection isAuthentificated={is_authentificated} />
    </WebContainer>
  );
}
