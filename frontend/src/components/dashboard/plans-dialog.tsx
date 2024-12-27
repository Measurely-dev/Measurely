import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import WebPricingCard from '@/components/website/pricing-card';
import { UserContext } from '@/dash-context';
import { plans } from '@/plans';
import { DialogTitle } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useContext, useState } from 'react';
import { toast } from 'sonner';

export default function PlansDialog(props: { children: ReactNode }) {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const router = useRouter();

  const subscribe = (plan: string) => {
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
          if (plan === 'starter') {
            toast.success('Successfully downgraded to the starter plan');
            router.refresh();
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
  };

  return (
    <Dialog>
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
        <div className='grid grid-cols-3 gap-5 overflow-y-scroll max-lg:gap-1 max-md:grid-cols-1 max-md:gap-5'>
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
                  user?.plan.identifier === plan.identifier
                    ? 'Current plan'
                    : 'Switch to ' + plan.name
                }
                loading={loading && selectedPlan === plan.identifier}
                disabled={user?.plan.identifier === plan.identifier || loading}
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
