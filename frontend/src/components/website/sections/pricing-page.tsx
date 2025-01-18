'use client';
import { plans } from '@/plans';
import WebPageHeader from '../page-header';
import WebPricingCard from '../pricing-card';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function PricingCardsSection(props: {
  isAuthentificated: string | null;
  type: 'waitlist' | 'default';
}) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const router = useRouter();

  function getEventAmount(value: number): string {
    const valueMap: Record<number, string> = {
      0: '10K',
      10: '50K',
      20: '100K',
      30: '250K',
      40: '500K',
      50: '1M',
      60: '2M',
      70: '4M',
      80: '6M',
      90: '8M',
      100: '10M+',
    };

    return valueMap[value] || 'N/A';
  }

  function calculatePrice(basePrice: number): number {
    const additionalCostPerStep = 5;
    const sliderSteps = sliderValue[0] / 10;
    let totalPrice = basePrice + additionalCostPerStep * sliderSteps;

    if (billingPeriod === 'year') {
      totalPrice = totalPrice * 12 * 0.8;
    }

    return Math.round(totalPrice);
  }

  const subscribe = (plan: string) => {
    if (props.isAuthentificated === 'true') {
      setSelectedPlan(plan);
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan }),
      })
        .then((resp) => {
          if (resp.status === 200) {
            if (plan === ' starter') {
              toast.success('Successfully downgraded to the starter plan');
            } else {
              return resp.json();
            }
          } else if (resp.status === 304) {
            toast.warning('You are already on this plan');
            setLoading(false);
          } else {
            resp.text().then((text) => {
              toast.error(text);
            });
            setLoading(false);
          }
        })
        .then((data) => {
          if (data !== null && data !== undefined) {
            toast.success('Opening checkout session...');
            setTimeout(() => router.push(data.url), 500);
          }
        });
    } else {
      router.push('/register');
    }
  };

  return (
    <>
      <WebPageHeader
        title={
          <span>
            <span className='mr-3 animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
              Pricing
            </span>
            that fits your needs
          </span>
        }
        description=''
      />
      <div className='mx-auto mt-[40px] flex w-full max-w-[400px] flex-row items-center gap-4'>
        <span className='font-mono text-sm font-medium text-primary'>10K</span>
        <Slider
          defaultValue={[0]}
          max={100}
          step={10}
          value={sliderValue}
          onValueChange={(e) => setSliderValue(e)}
          formatLabel={(value) =>
            getEventAmount(value) === '10M+'
              ? `${getEventAmount(value)} events`
              : `Up to ${getEventAmount(value)} events`
          }
        />
        <span className='font-mono text-sm font-medium text-primary'>10M+</span>
      </div>
      <ToggleGroup
        type='single'
        variant='default'
        className='mx-auto my-[30px] w-fit rounded-[12px] bg-accent p-1'
        onValueChange={(value) => {
          if (value !== billingPeriod) {
            setBillingPeriod(value === 'year' ? 'year' : 'month');
          }
        }}
        value={billingPeriod}
      >
        <ToggleGroupItem
          value='month'
          className='rounded-[10px] data-[state=on]:!bg-background'
        >
          Monthly
        </ToggleGroupItem>
        <ToggleGroupItem
          value='year'
          className='flex items-center rounded-[10px] data-[state=on]:!bg-background'
        >
          Yearly
          <span className='bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
            -20%
          </span>
        </ToggleGroupItem>
      </ToggleGroup>
      <div className='grid grid-cols-3 gap-[10px] max-lg:grid-cols-1'>
        {plans.map((plan, i) => {
          const isStarter = plan.name === 'Starter';
          return (
            <WebPricingCard
              className={
                plan.name === 'Plus'
                  ? 'border-4 border-blue-300 ring-4 ring-purple-200'
                  : 'lg:scale-95'
              }
              key={i}
              sliderValue={getEventAmount(sliderValue[0])}
              name={plan.name}
              popular={plan.name === 'Plus' ? true : false}
              description={plan.description}
              price={isStarter ? plan.price : calculatePrice(plan.price)}
              recurrence={plan.name === 'Starter' ? 'forever' : billingPeriod}
              target={plan.target}
              list={plan.list}
              button={
                plan.identifier === 'starter'
                  ? 'Get started'
                  : 'Continue with ' + plan.name
              }
              loading={loading && selectedPlan === plan.identifier}
              disabled={props.type === 'waitlist' ? true : loading}
              onSelect={() => {
                subscribe(plan.identifier);
              }}
            />
          );
        })}
      </div>
    </>
  );
}
