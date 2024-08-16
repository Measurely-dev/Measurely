import WebPageHeader from '../../components/pageHeader';
import WebPricingCard from '../../components/pricingCard';

export default function PricingCardsSection() {
  return (
    <>
      <WebPageHeader
        title={
          <span>
            Pricing for all
            <br />
            different types of teams
          </span>
        }
        description='Find the plan the best suited for your team'
      />
      <div className='mt-[70px] grid grid-cols-3 gap-[10px]'>
        <WebPricingCard
          recurrence='month'
          name='Free'
          description='Everything you need to get started with 10,500 free MAU. No setup fees, monthly fees, or hidden fees.'
          price={0}
          reccurence='forever'
          target='very small teams'
          list={[
            {
              name: 'Real-time contact syncing',
            },
            {
              name: 'Automatic data enrichment',
            },
            {
              name: 'Up to 3 seats',
            },
          ]}
          button='Get started now'
        />
        <WebPricingCard
          recurrence='month'
          name='Plus'
          description='Advanced features to help you scale any business without limits.'
          price={25}
          reccurence='month'
          target='growing teams'
          list={[
            {
              name: 'Private lists',
            },
            {
              name: 'Enhanced email sending',
            },
            {
              name: 'No seat limits',
            },
          ]}
          button='Continue with Plus'
        />
        <WebPricingCard
          recurrence='month'
          name='Pro'
          description='For teams with more complex needs requiring the highest levels of support.'
          price={59}
          reccurence='month'
          target='scaling businesses'
          list={[
            {
              name: 'Fully adjustable permissions',
            },
            {
              name: 'Advanced data enrichment',
            },
            {
              name: 'Priority support',
            },
          ]}
          button='Continue with Pro'
        />
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
