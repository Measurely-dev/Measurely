import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento';
import ShowcaseLandingSection from '@/components/website/sections/showcase';
import { headers } from 'next/headers';

export default function Home() {
  const is_authenticated = headers().get('is-authentificated');

  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    fetch(
      `https://api.measurely.dev/event/${process.env.NEXT_PUBLIC_MEASURELY_API_KEY}/88f02565-f86a-4998-9265-d1b2d5858598`,
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
      <BentoUiSection isAuthentificated={is_authenticated} />
    </WebContainer>
  );
}
