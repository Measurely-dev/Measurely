'use client';

// Import necessary dependencies
import { plans } from '@/plans';
import PricingCard from '../pricing-card';
import { useRouter } from 'next/navigation';
import HeroTitle from '../hero-title';

// Component that renders the subscription UI section with pricing plans
export default function SubscriptionUiSection() {
  // State for managing loading state and selected plan
  const router = useRouter();
  
  return (
    <div className='mt-[145px] pt-12'>
      {/* Pricing section header */}
      <HeroTitle
        title='Pricing that fits your need'
        subtitle='Transparent pricing'
      />

      {/* Grid of pricing cards */}
      <div className='mt-[70px] grid grid-cols-3 max-md:grid-cols-1 max-md:gap-3'>
        {plans.map((plan, i) => {
          return (
            <PricingCard
              key={i}
              startingFrom
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
              onSelect={() => {
                router.push("/waitlist")
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
