export const plans = [
  {
    name: 'Starter',
    identifier: 'starter',
    description: 'Free with 5 metrics, 1 app. No setup or hidden fees.',
    price: 0,
    reccurence: 'forever',
    target: 'very small teams',
    list: [
      <div key='1'>
        <strong className='text-black'>1</strong> project
      </div>,
      <div key='2'>
        <strong className='text-black'>5</strong> metrics per project
      </div>,
      <div key='3'>
        <strong className='text-black'>25</strong> updates per minute
      </div>,
      <div key='4'>
        <strong className='text-black'>5k</strong> updates per month
      </div>,
      <div key='5'>
        Support (<strong className='text-black'>2-3</strong> business days)
      </div>,
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
      <div key='1'>
        <strong className='text-black'>3</strong> projects
      </div>,
      <div key='2'>
        <strong className='text-black'>15</strong> metrics per project
      </div>,
      <div key='3'>
        <strong className='text-black'>1K</strong> updates per minute
      </div>,
      <div key='4'>
        <strong className='text-black'>1M</strong> updates per month
      </div>,
      <div key='5'>
        Support (<strong className='text-black'>1-2</strong> business days)
      </div>,
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
      <div key='1'>
        <strong className='text-black'>10</strong> projects
      </div>,
      <div key='2'>
        <strong className='text-black'>35</strong> metrics per project
      </div>,
      <div key='3'>
        <strong className='text-black'>10K</strong> updates per minute
      </div>,
      <div key='4'>
        <strong className='text-black'>10M</strong> updates per month
      </div>,
      <div key='5'>
        Support (<strong className='text-black'>1</strong> business days)
      </div>,
    ],
    button: 'Continue with Pro',
  },
];
