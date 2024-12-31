import WebContainer from '@/components/website/container';
import BentoUiSection from '@/components/website/sections/bento-landing-page';
import Landing from '@/components/website/sections/landing-page';
import { headers } from 'next/headers';
import Measurely from 'measurely-js';

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const is_authenticated = headers().get('is-authentificated');

  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    Measurely.init(process.env.NEXT_PUBLIC_MEASURELY_API_KEY ?? '');

    let id = 'beff3986-f11f-4e19-93e0-7654604f1d3b';

    if (searchParams?.['ref'] === 'reddit') {
      id = 'f1462a96-73be-4f00-a162-a49edfbedefc';
    } else if (searchParams?.['ref'] === 'twitter') {
      id = '3970f9cd-eb3b-40ee-b16a-24a3ffd41963';
    } else if (searchParams?.['ref'] === 'bluesky') {
      id = '54215fad-ec90-4f98-9843-3039c3f28881';
    }

    Measurely.capture(id, {
      value: 1,
    });
  }
  return (
    <WebContainer>
      <Landing />
      <BentoUiSection isAuthentificated={is_authenticated} />
    </WebContainer>
  );
}
