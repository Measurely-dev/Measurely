'use client';
import { plans } from '@/plans';
import WebPageHeader from '../page-header';
import WebPricingCard from '../pricing-card';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PricingOptions } from '@/components/dashboard/pricing-options';

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
      <PricingOptions
        billingPeriod={billingPeriod}
        getEventAmount={getEventAmount}
        setBillingPeriod={setBillingPeriod}
        setSliderValue={setSliderValue}
        sliderValue={sliderValue}
      />
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
