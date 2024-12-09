import { pricingData } from '@/components/global/pricingData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import WebPricingCard from '@/components/website/components/pricingCard';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

export default function PlansDialog(props: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='w-[95%] overflow-y-scroll max-h-[95%] min-w-[95%] rounded-sm shadow-sm'>
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
        <div className='grid mt-5 max-md:grid-cols-1 max-md:gap-5 max-lg:gap-1 overflow-y-scroll grid-cols-3 gap-5'>
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
