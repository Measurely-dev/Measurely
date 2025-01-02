// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true;
  items?: EachRoute[];
};

export const ROUTES: EachRoute[] = [
  {
    title: 'Getting Started',
    href: '/getting-started',
    noLink: true,
    items: [{ title: 'Introduction', href: '/introduction' }],
  },
  {
    title: 'Setup',
    href: '/setup',
    noLink: true,
    items: [{ title: 'Quickstart', href: '/quickstart' }],
  },
  {
    title: 'Features',
    href: '/features',
    noLink: true,
    items: [
      { title: 'Basic metric', href: '/basic-metric' },
      { title: 'Dual metric', href: '/dual-metric' },
      { title: 'Chart Options', href: '/chart-options' },
      { title: 'Filters', href: '/filters' }
    ],
  },
  {
    title: 'API reference',
    href: '/api-reference',
    noLink: true,
    items: [{ title: 'Version 1', href: '/v1' }],
  },
  {
    title: 'Code integrations',
    href: '/code-integrations',
    noLink: true,
    items: [
      { title: 'JS/TS', href: '/javascript-typescript' },
      { title: 'Golang', href: '/golang' },
      { title: 'Python', href: '/python' },
    ],
  },
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (!node.noLink) {
    ans.push({ title: node.title, href: node.href });
  }
  node.items?.forEach((subNode) => {
    const temp = { ...subNode, href: `${node.href}${subNode.href}` };
    ans.push(...getRecurrsiveAllLinks(temp));
  });
  return ans;
}

export const page_routes = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
