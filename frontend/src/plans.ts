export const plans = [
  {
    name: 'Starter',
    identifier: 'starter',
    description:
      'Free with 2 metrics, 1 app. No setup or hidden fees.',
    price: 0,
    reccurence: 'forever',
    target: 'very small teams',
    list: [
      {
        name: '1 applications',
      },
      {
        name: '2 metrics per application',
      },
      {
        name: '10 updates per minute',
      },
      {
        name: '10,000 updates per month',
      },
    ],
    button: 'Get started now',
  },
  {
    name: 'Plus',
    identifier: 'plus',
    description: 'More features and higher limits, all at a fair price.',
    price: 9,
    reccurence: 'month',
    target: 'growing teams',
    list: [
      {
        name: '3 applications',
      },
      {
        name: '10 metrics per application',
      },
      {
        name: '1,000 updates per minute',
      },
      {
        name: '1,000,000 updates per month',
      },
    ],
    button: 'Continue with Plus',
  },
  {
    name: 'Pro',
    identifier: 'pro',
    description: 'Top-tier tools and limits for advanced users, no surprises.',
    price: 22,
    reccurence: 'month',
    target: 'scaling businesses',
    list: [
      {
        name: '10 applications',
      },
      {
        name: '30 metrics per application',
      },
      {
        name: '10,000 updates per minute',
      },
      {
        name: '1,000,000,000 updates per month',
      },
    ],
    button: 'Continue with Pro',
  },
];
