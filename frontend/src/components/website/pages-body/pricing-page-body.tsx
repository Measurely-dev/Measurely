'use client';

// Import necessary dependencies and components
import { plans } from '@/plans';
import PageHeader from '../page-header';
import PricingCard from '@/components/global/pricing-card';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingOptions } from '@/components/global/pricing-options';
import { calculatePrice, getEventAmount, getEventCount } from '@/utils';

// Main pricing component that handles plan selection and display
export default function PricingBody() {
  // State management for pricing interface
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [window_width, set_window_width] = useState(window.innerWidth);
  const router = useRouter();

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
        setBillingPeriod={setBillingPeriod}
        setSliderValue={setSliderValue}
        sliderValue={sliderValue}
        type={optionType}
      />
      <div
        className={`grid grid-cols-3 max-lg:grid-cols-1 max-lg:gap-[10px] ${window_width > 768 ? 'mt-10' : ''}`}
      >
        {plans.map((plan, i) => {
          const price = calculatePrice(
            plan.price,
            plan.identifier,
            getEventCount(sliderValue[0]),
            billingPeriod,
          );
          return (
            <PricingCard
              key={i}
              className={`lg:first:rounded-e-none lg:first:border-r-0 lg:last:rounded-s-none lg:last:border-l-0 ${plan.name === 'Plus' ? 'lg:z-10 lg:scale-105 lg:bg-background lg:shadow-xl' : ''}`}
              sliderValue={getEventAmount(sliderValue[0])}
              name={plan.name}
              description={plan.description}
              price={price}
              recurrence={plan.name === 'Starter' ? 'forever' : billingPeriod}
              target={plan.target}
              list={plan.list}
              button={
                plan.identifier === 'starter'
                  ? 'Get started'
                  : 'Continue with ' + plan.name
              }
              onSelect={() => {
                router.push('/waitlist');
              }}
            />
          );
        })}
      </div>
    </>
  );
}
