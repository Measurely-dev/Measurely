import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EachRoute, ROUTES } from './routes-config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  'focus:ring-2',
  // ring color
  'focus:ring-blue-200 focus:dark:ring-blue-700/30',
  // border color
  'focus:border-blue-500 focus:dark:border-blue-700',
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  'outline outline-offset-2 outline-0 focus-visible:outline-2',
  // outline color
  'outline-blue-500 dark:outline-blue-500',
];

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  'ring-2',
  // border color
  'border-red-500 dark:border-red-700',
  // ring color
  'ring-red-200 dark:ring-red-700/30',
];

export function helperSearch(
  query: string,
  node: EachRoute,
  prefix: string,
  currenLevel: number,
  maxLevel?: number,
) {
  const res: EachRoute[] = [];
  let parentHas = false;

  const nextLink = `${prefix}${node.href}`;
  if (!node.noLink && node.title.toLowerCase().includes(query.toLowerCase())) {
    res.push({ ...node, items: undefined, href: nextLink });
    parentHas = true;
  }
  const goNext = maxLevel ? currenLevel < maxLevel : true;
  if (goNext)
    node.items?.forEach((item) => {
      const innerRes = helperSearch(
        query,
        item,
        nextLink,
        currenLevel + 1,
        maxLevel,
      );
      if (!!innerRes.length && !parentHas && !node.noLink) {
        res.push({ ...node, items: undefined, href: nextLink });
        parentHas = true;
      }
      res.push(...innerRes);
    });
  return res;
}

export function advanceSearch(query: string) {
  return ROUTES.map((node) =>
    helperSearch(query, node, '', 1, query.length == 0 ? 2 : undefined),
  ).flat();
}

export function formatDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString('en-US', options);
}

export function formatDate2(dateStr: string): string {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export function stringToDate(date: string) {
  const [day, month, year] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getContrastYIQ(hexColor: string): 'light' | 'dark' {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = r * 0.299 + g * 0.587 + b * 0.114;

  return yiq >= 128 ? 'light' : 'dark';
}
