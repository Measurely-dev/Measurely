import { pricingData } from '@/components/global/pricing-data';
import WebPageHeader from '../page-header';
import WebPricingCard from '../pricing-card';
export default function SubscriptionUiSection() {
  return (
    <div className='mt-[145px] rounded-3xl bg-background p-8 pt-12'>
      <WebPageHeader
        title={
          <span>
            <span className='mr-3 animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
              Pricing
            </span>
            that fits
            <br /> your needs
          </span>
        }
        description=''
      />
      <div className='mt-[20px] grid grid-cols-3 gap-[10px] max-md:grid-cols-1'>
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
    </div>
  );
}
