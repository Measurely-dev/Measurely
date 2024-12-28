'use client';
import { plans } from '@/plans';
import WebPageHeader from '../page-header';
import WebPricingCard from '../pricing-card';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PricingCardsSection(props: {
  isAuthentificated: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const router = useRouter();

  const enterpriseList = [
    <div key='1'>
      Up to <strong className='text-black'>100</strong> applications
    </div>,
    <div key='2'>
      Up to an <strong className='text-black'>unlimited</strong> amount of
      metrics per application
    </div>,
    <div key='3'>
      Up to <strong className='text-black'>10,000</strong> updates per minute
    </div>,
    <div key='4'>
      Up to an <strong className='text-black'>unlimited</strong> amount of
      updates per month
    </div>,
    <div key='5'>
      Support <strong className='text-black'>SLAs</strong> available
    </div>,
  ];

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
            <br className='sm:hidden' />
            that fits
            <br /> your needs
          </span>
        }
        description="No hidden fees, just the plan that's right for you"
      />
      <div className='mt-[70px] grid grid-cols-3 gap-[10px] max-lg:grid-cols-1'>
        {plans.map((plan, i) => {
          return (
            <WebPricingCard
              key={i}
              name={plan.name}
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
              disabled={loading}
              onSelect={() => {
                subscribe(plan.identifier);
              }}
            />
          );
        })}
      </div>
      <WebPricingCard
        recurrence='month'
        name='Entreprise'
        className='mt-5'
        description='Designed for businesses requiring custom solutions. Enjoy personalized limits, advanced features, and premium support to meet your unique needs. Reach out to our sales team to craft a plan tailored specifically for you.'
        price='custom pricing'
        reccurence='forever'
        target='large organizations'
        list={enterpriseList}
        button='Talk to sales'
      />
    </>
  );
}
