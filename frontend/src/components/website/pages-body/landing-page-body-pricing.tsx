'use client';

// Import necessary dependencies
import { plans } from '@/plans';
import PricingCard from '../pricing-card';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import HeroTitle from '../hero-title';

// Component that renders the subscription UI section with pricing plans
export default function SubscriptionUiSection(props: {
  isAuthentificated: string | null;
  type: 'waitlist' | 'default';
}) {
  // State for managing loading state and selected plan
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const router = useRouter();

  // Handler for plan subscription
  const subscribe = (plan: string) => {
    // Check if user is authenticated
    if (props.isAuthentificated === 'true') {
      setSelectedPlan(plan);
      setLoading(true);

      // Make API call to subscribe endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan }),
      })
        .then((resp) => {
          if (resp.status === 200) {
            // Handle successful subscription
            if (plan === ' starter') {
              toast.success('Successfully downgraded to the starter plan');
            } else {
              return resp.json();
            }
          } else if (resp.status === 304) {
            // Handle case where user is already on selected plan
            toast.warning('You are already on this plan');
            setLoading(false);
          } else {
            // Handle error cases
            resp.text().then((text) => {
              toast.error(text);
            });
            setLoading(false);
          }
        })
        .then((data) => {
          // Redirect to checkout if needed
          if (data !== null && data !== undefined) {
            toast.success('Opening checkout session...');
            setTimeout(() => router.push(data.url), 500);
          }
        });
    } else {
      // Redirect to register if not authenticated
      router.push('/register');
    }
  };

  return (
    <div className='mt-[145px] pt-12'>
      {/* Pricing section header */}
      <HeroTitle title='Pricing that fits your need' subtitle='Transparent pricing' />

      {/* Grid of pricing cards */}
      <div className='mt-[70px] grid grid-cols-3 max-md:grid-cols-1 max-md:gap-3'>
        {plans.map((plan, i) => {
          return (
            <PricingCard
              key={i}
              name={plan.name}
              className={`md:first:rounded-e-none md:first:border-r-0 md:last:rounded-s-none md:last:border-l-0 ${plan.name === 'Plus' ? 'md:z-10 md:scale-105 md:bg-background md:shadow-xl' : ''}`}
              description={plan.description}
              price={plan.price}
              recurrence={plan.reccurence}
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
    </div>
  );
}
