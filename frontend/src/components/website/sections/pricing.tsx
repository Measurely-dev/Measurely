import { plans } from '@/plans';
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
            />
          );
        })}
      </div>
    </div>
  );
}
