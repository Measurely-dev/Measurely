'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import PricingCard from '@/components/global/pricing-card';
import { plans } from '@/plans';
import { useConfirm } from '@omit/react-confirm-dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { ArrowBigDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { PricingOptions } from './global/pricing-options';
import { calculatePrice, getEventCount } from '@/utils';

// PlansDialog component handles the subscription plan selection and management
export default function PlansDialog(props: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const router = useRouter();
  const confirm = useConfirm();
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  // Maps slider values to event amount strings
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

  // Handles the subscription process for a selected plan
  const subscribe = async (plan: string) => {
    setSelectedPlan(plan);
    setLoading(true);

    let isConfirmed = true;

    // Show confirmation dialog for downgrading to starter plan
    if (plan === 'starter') {
      isConfirmed = await confirm({
        title: 'Downgrade Plan',
        icon: (
          <ArrowBigDown className='size-6 fill-destructive text-destructive' />
        ),
        description: 'Are you sure you want to downgrade to the starter plan?',
        confirmText: 'Yes, Downgrade',
        cancelText: 'Cancel',
        cancelButton: {
          size: 'default',
          variant: 'outline',
        },
        confirmButton: {
          className: 'bg-red-500 hover:bg-red-600 text-white',
        },
        alertDialogTitle: {
          className: 'flex items-center gap-1',
        },
      });
    }

    if (isConfirmed) {
      // Make API call to subscribe to selected plan
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan }),
      })
        .then((resp) => {
          if (resp.status === 200) {
            if (plan === 'starter') {
              toast.success('Successfully downgraded to the starter plan');
              window.location.reload();
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
      setLoading(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(e) => {
        if (!e) {
          setSliderValue([0]);
          setBillingPeriod('month');
        }
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='max-h-[95%] w-[95%] !max-w-[1100px] overflow-y-scroll rounded-sm shadow-sm max-lg:min-w-[95%]'>
        <DialogHeader className='!m-0 flex flex-row items-center justify-between !p-0'>
          <DialogTitle className='text-2xl'>Plans</DialogTitle>
          <DialogClose className='!m-0 h-full !p-0'>
            <Button
              type='button'
              size={'icon'}
              variant='secondary'
              className='rounded-[12px]'
            >
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <PricingOptions
          billingPeriod={billingPeriod}
          setBillingPeriod={setBillingPeriod}
          setSliderValue={setSliderValue}
          sliderValue={sliderValue}
          type='dialog'
        />
        <div className='grid grid-cols-3 gap-5 overflow-y-scroll max-lg:gap-1 max-md:grid-cols-1 max-md:gap-5'>
          {plans.map((plan, i) => {
            const price = calculatePrice(plan.price, plan.name, getEventCount(sliderValue[0]), billingPeriod)
            return (
              <PricingCard
                key={i}
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
                loading={loading && selectedPlan === plan.identifier}
                disabled={loading}
                onSelect={() => {
                  subscribe(plan.identifier);
                }}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
