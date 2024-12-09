import { pricingData } from '@/components/global/pricing-data';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import WebPricingCard from '@/components/website/pricing-card';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

export default function PlansDialog(props: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='max-h-[95%] w-[95%] min-w-[95%] overflow-y-scroll rounded-sm shadow-sm'>
        <DialogHeader className='static'>
          <DialogClose className='absolute right-5 top-3'>
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
        <div className='mt-5 grid grid-cols-3 gap-5 overflow-y-scroll max-lg:gap-1 max-md:grid-cols-1 max-md:gap-5'>
          {pricingData.map((card, i) => {
            return (
              <WebPricingCard
                key={i}
                name={card.name}
                description={card.description}
                price={card.price}
                recurrence={card.reccurence}
                target={card.target}
                list={card.list}
                button={card.button}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
