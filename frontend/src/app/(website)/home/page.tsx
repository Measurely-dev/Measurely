import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento';
import ShowcaseLandingSection from '@/components/website/sections/showcase';
import { headers } from 'next/headers';

export default async function Home() {
  const headersList = await headers();
  const is_authenticated = headersList.get('is-authentificated');

  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    fetch(
      `https://api.measurely.dev/event/${process.env.NEXT_PUBLIC_MEASURELY_API_KEY}/1995094a-5b26-43d0-81b7-bd7647beb572`,
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
