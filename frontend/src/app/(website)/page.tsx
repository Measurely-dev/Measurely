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
    let ref =
      searchParams?.['ref'] === undefined
        ? 'direct'
        : (searchParams['ref'] as string);
    const refs = [
      'reddit',
      'twitter',
      'discord',
      'bluesky',
      'producthunt',
      'direct',
      'launchtory',
      'quora',
      'indiehackers',
    ];

    if (!refs.includes(ref)) ref = 'direct';

    Measurely.init(process.env.NEXT_PUBLIC_MEASURELY_API_KEY ?? '');

    const metricId = 'beff3986-f11f-4e19-93e0-7654604f1d3b';
    const payload = {
      value: 1,
      filters: {
        'traffic source': ref,
      },
    };

    Measurely.capture(metricId, payload);
  }

  return (
    <WebContainer>
      <Landing type='waitlist' />
      <BentoUiSection type='waitlist' isAuthentificated={is_authenticated} />
    </WebContainer>
  );
}
