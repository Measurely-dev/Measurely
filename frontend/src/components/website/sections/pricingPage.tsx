import { plans } from '@/plans';
import WebPageHeader from '../page-header';
import WebPricingCard from '../pricing-card';

export default function PricingCardsSection() {
  return (
    <>
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
        description='Find the plan the best suited for you'
      />
      <div className='mt-[70px] grid grid-cols-3 gap-[10px] max-md:grid-cols-1'>
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
      <WebPricingCard
        recurrence='month'
        name='Entreprise'
        className='mt-5'
        description='Everything you need to get started with 10,500 free MAU. No setup fees, monthly fees, or hidden fees.'
        price='custom'
        reccurence='forever'
        target='large organizations'
        list={[
          {
            name: 'Unlimited reporting',
          },
          {
            name: 'SAML and SSO',
          },
          {
            name: 'Custom billing',
          },
        ]}
        button='Talk to sales'
      />
    </>
  );
}
