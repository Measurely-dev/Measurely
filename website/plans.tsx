export const plans = [
  {
    name: "Starter",
    identifier: "starter",
    description: "Free tier. No setup or hidden fees.",
    price: 0,
    reccurence: "forever",
    target: "very small teams",
    list: [
      <div key="1">
        <strong className="text-primary">1</strong> team member
      </div>,
      <div key="2">
        <strong className="text-primary">3</strong> metrics
      </div>,
      <div key="3">
        <strong className="text-primary">1</strong> filter categories per metric
      </div>,
      <div key="4">
        <strong className="text-primary">6</strong> filters per filter category
      </div>,
      <div key="5">
        <strong className="text-primary">3</strong> blocks
      </div>,
      <div key="6">
        <strong className="text-primary">Up to 5k</strong> events per month
      </div>,
      <div key="7">
        Support (<strong className="text-primary">2-3</strong> business days)
      </div>,
    ],
    button: "Get started now",
  },
  {
    name: "Plus",
    identifier: "plus",
    description: "More features and higher limits, all at a fair price.",
    price: 9,
    reccurence: "month",
    target: "growing teams",
    list: [
      <div key="1">
        <strong className="text-primary">5</strong> team members
      </div>,
      <div key="2">
        <strong className="text-primary">10</strong> metrics
      </div>,
      <div key="3">
        <strong className="text-primary">8</strong> filter categories per metric
      </div>,
      <div key="4">
        <strong className="text-primary">15</strong> filters per filter category
      </div>,
      <div key="5">
        <strong className="text-primary">5</strong> blocks
      </div>,
      <div key="6">
        <strong className="text-primary">Up to 10M</strong> events per month
      </div>,
      <div key="7">
        Support (<strong className="text-primary">1-2</strong> business days)
      </div>,
    ],
    button: "Continue with Plus",
  },
  {
    name: "Pro",
    identifier: "pro",
    description: "Top-tier tools and limits for advanced users, no surprises.",
    price: 22,
    reccurence: "month",
    target: "scaling businesses",
    list: [
      <div key="1">
        <strong className="text-primary">20</strong> team members
      </div>,
      <div key="2">
        <strong className="text-primary">30</strong> metrics
      </div>,
      <div key="3">
        <strong className="text-primary">20</strong> filter categories per
        metric
      </div>,
      <div key="4">
        <strong className="text-primary">35</strong> filters per filter category
      </div>,
      <div key="5">
        <strong className="text-primary">20</strong> blocks
      </div>,
      <div key="6">
        <strong className="text-primary">Up to 10M</strong> events per month
      </div>,
      <div key="7">
        Support (<strong className="text-primary">1</strong> business days)
      </div>,
    ],
    button: "Continue with Pro",
  },
];
