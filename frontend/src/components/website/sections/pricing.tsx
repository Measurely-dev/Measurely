'use client';
import { plans } from '@/plans';
import WebPageHeader from '../page-header';
import WebPricingCard from '../pricing-card';
import { useContext, useState } from 'react';
import { UserContext } from '@/dash-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
export default function SubscriptionUiSection(props: {
  isAuthentificated: string | null;
}) {
  const { user, setUser } = useContext(UserContext);
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
            return resp.json();
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
            if (plan === 'starter') {
              toast.success('Successfully downgraded to the starter plan');
              setUser(Object.assign({}, user, { plan: 'starter' }));
            } else {
              toast.success('Opening checkout session...');
              setTimeout(() => router.push(data.url), 500);
            }
          }
        });
    } else {
      router.push('/register');
    }
  };
  return (
    <div className='mt-[145px] rounded-3xl bg-background p-8 pt-12'>
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
        description=''
      />
      <div className='mt-[20px] grid grid-cols-3 gap-[10px] max-md:grid-cols-1'>
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
                  : user?.plan === plan.identifier
                    ? 'Current plan'
                    : 'Continue with ' + plan.name
              }
              loading={loading && selectedPlan === plan.identifier}
              disabled={user?.plan === plan.identifier || loading}
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
