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
import { ReactNode, useContext } from 'react';

export default function PlansDialog(props: { children: ReactNode }) {
  const users = useContext(UserContext);
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='max-h-[95%] w-[95%] min-w-[95%] overflow-y-scroll rounded-sm shadow-sm'>
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
                button={plan.button}
                disabled={users?.user?.plan === plan.identifier ? true : false}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
