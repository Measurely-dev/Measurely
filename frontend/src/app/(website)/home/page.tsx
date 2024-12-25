import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento';
import ShowcaseLandingSection from '@/components/website/sections/showcase';
import { headers } from 'next/headers';

export default async function Home() {
  const headersList = await headers();
  const is_authenticated = headersList.get('is-authentificated');

  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    fetch(
      `https://api.measurely.dev/event/${process.env.NEXT_PUBLIC_MEASURELY_API_KEY}/08c46098-a3c7-40c3-9ebb-c5e128c1a8cd`,
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
