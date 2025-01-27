'use client';

// Import necessary dependencies and components
import { plans } from '@/plans';
import PageHeader from '../page-header';
import PricingCard from '../pricing-card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PricingOptions } from '@/components/dashboard/pricing-options';

// Main pricing component that handles plan selection and display
export default function PricingBody(props: {
  isAuthentificated: string | null;
  type: 'waitlist' | 'default';
}) {
  // State management for pricing interface
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [window_width, set_window_width] = useState(window.innerWidth);
  const router = useRouter();

  // Maps slider values to event amounts for display
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

  // Calculates price based on selected plan and billing period
  function calculatePrice(basePrice: number): number {
    const additionalCostPerStep = 5;
    const sliderSteps = sliderValue[0] / 10;
    let totalPrice = basePrice + additionalCostPerStep * sliderSteps;

    if (billingPeriod === 'year') {
      totalPrice = totalPrice * 12 * 0.8; // 20% discount for yearly billing
    }

    return Math.round(totalPrice);
  }

  // Handles plan subscription process
  const subscribe = (plan: string) => {
    if (props.isAuthentificated === 'true') {
      setSelectedPlan(plan);
      setLoading(true);

      // Make subscription API request
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

  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      set_window_width(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine pricing options display type based on screen width
  const optionType = window_width > 768 ? 'dialog' : 'page';

  return (
    <>
      <PageHeader
        title='Transparent pricing, built to grow with your project.'
        description='Use Measurely for free to track your metrics. Upgrade to enable unlimited team members, more events, and additional features.'
        className='mx-auto mb-10'
        descriptionClassName=' text-base text-primary max-w-[800px] mx-auto'
      />
      <PricingOptions
        billingPeriod={billingPeriod}
        getEventAmount={getEventAmount}
        setBillingPeriod={setBillingPeriod}
        setSliderValue={setSliderValue}
        sliderValue={sliderValue}
        type={optionType}
      />
      <div
        className={`grid grid-cols-3 max-lg:grid-cols-1 max-lg:gap-[10px] ${window_width > 768 ? 'mt-10' : ''}`}
      >
        {plans.map((plan, i) => {
          const isStarter = plan.name === 'Starter';
          return (
            <PricingCard
              className={`lg:first:rounded-e-none lg:first:border-r-0 lg:last:rounded-s-none lg:last:border-l-0 ${plan.name === 'Plus' ? 'lg:z-10 lg:scale-105 lg:bg-background lg:shadow-xl' : ''}`}
              key={i}
              sliderValue={getEventAmount(sliderValue[0])}
              name={plan.name}
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
