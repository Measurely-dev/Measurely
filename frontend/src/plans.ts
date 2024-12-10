export const plans = [
  {
    name: 'Starter',
    identifier: 'starter',
    description:
      'Everything you need to get started with 10,500 free MAU. No setup fees, monthly fees, or hidden fees.',
    price: 0,
    reccurence: 'forever',
    target: 'very small teams',
    list: [
      {
        name: 'Real-time contact syncing',
      },
      {
        name: 'Automatic data enrichment',
      },
      {
        name: 'Up to 3 seats',
      },
    ],
    button: 'Get started now',
  },
  {
    name: 'Plus',
    identifier: 'plus',
    description:
      'Advanced features to help you scale any business without limits.',
    price: 25,
    reccurence: 'month',
    target: 'growing teams',
    list: [
      {
        name: 'Private lists',
      },
      {
        name: 'Enhanced email sending',
      },
      {
        name: 'No seat limits',
      },
    ],
    button: 'Continue with Plus',
  },
  {
    name: 'Pro',
    identifier: 'pro',
    description:
      'For teams with more complex needs requiring the highest levels of support.',
    price: 59,
    reccurence: 'month',
    target: 'scaling businesses',
    list: [
      {
        name: 'Fully adjustable permissions',
      },
      {
        name: 'Advanced data enrichment',
      },
      {
        name: 'Priority support',
      },
    ],
    button: 'Continue with Pro',
  },
];
