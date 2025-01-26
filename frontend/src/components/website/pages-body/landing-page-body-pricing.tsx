'use client';
import { plans } from '@/plans';
import PageHeader from '../page-header';
import PricingCard from '../pricing-card';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
export default function SubscriptionUiSection(props: {
  isAuthentificated: string | null;
  type: 'waitlist' | 'default';
}) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const router = useRouter();
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
    <div className='mt-[145px] pt-12'>
      <PageHeader
        title={
          <span>
            <span className='mr-3 animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
              Pricing
            </span>
            <br className='sm:hidden' />
            that fits
            <br /> your needs
          </span>
        }
        description=''
      />
      <div className='mt-[60px] grid grid-cols-3 max-md:mt-[20px] max-md:grid-cols-1 max-md:gap-3'>
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
