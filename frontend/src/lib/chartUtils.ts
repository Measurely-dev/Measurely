import { ColorKey } from '@/app/dashboard/(loading)/(main)/page';

export type ColorUtility = 'bg' | 'stroke' | 'fill' | 'text';
export const colorSchemeMap: Record<
  ColorKey,
  { bg: string; stroke: string; fill: string; text: string }
> = {
  pink: {
    bg: 'bg-pink-400',
    stroke: 'stroke-pink-500',
    fill: 'fill-pink-500',
    text: 'text-pink-500',
  },
  blue: {
    bg: 'bg-blue-500',
    stroke: 'stroke-blue-600',
    fill: 'fill-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-400',
    stroke: 'stroke-green-500',
    fill: 'fill-green-500',
    text: 'text-green-500',
  },
  purple: {
    bg: 'bg-purple-400',
    stroke: 'stroke-purple-500',
    fill: 'fill-purple-500',
    text: 'text-purple-500',
  },
  orange: {
    bg: 'bg-orange-500',
    stroke: 'stroke-orange-600',
    fill: 'fill-orange-600',
    text: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-500',
    stroke: 'stroke-red-600',
    fill: 'fill-red-600',
    text: 'text-red-600',
  },
  yellow: {
    bg: 'bg-yellow-500',
    stroke: 'stroke-yellow-600',
    fill: 'fill-yellow-600',
    text: 'text-yellow-600',
  },
  cyan: {
    bg: 'bg-cyan-500',
    stroke: 'stroke-cyan-600',
    fill: 'fill-cyan-600',
    text: 'text-cyan-600',
  },
  indigo: {
    bg: 'bg-indigo-500',
    stroke: 'stroke-indigo-600',
    fill: 'fill-indigo-600',
    text: 'text-indigo-600',
  },
  magenta: {
    bg: 'bg-fuchsia-500',
    stroke: 'stroke-pink-600',
    fill: 'fill-pink-600',
    text: 'text-pink-600',
  },
  fuchsia: {
    bg: 'bg-fuchsia-400',
    stroke: 'stroke-fuchsia-500',
    fill: 'fill-fuchsia-500',
    text: 'text-fuchsia-500',
  },
  violet: {
    bg: 'bg-violet-500',
    stroke: 'stroke-violet-600',
    fill: 'fill-violet-600',
    text: 'text-violet-600',
  },
  lime: {
    bg: 'bg-lime-500',
    stroke: 'stroke-lime-600',
    fill: 'fill-lime-600',
    text: 'text-lime-600',
  },
  gray: {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-600',
    fill: 'fill-gray-600',
    text: 'text-gray-600',
  },
};
export const chartColorSchemeMap: any = {
  pink: {
    bg: 'bg-pink-400',
    stroke: 'stroke-pink-500',
    fill: 'fill-pink-500',
    text: 'text-pink-500',
  },
  blue: {
    bg: 'bg-blue-500',
    stroke: 'stroke-blue-600',
    fill: 'fill-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-400',
    stroke: 'stroke-green-500',
    fill: 'fill-green-500',
    text: 'text-green-500',
  },
  purple: {
    bg: 'bg-purple-400',
    stroke: 'stroke-purple-500',
    fill: 'fill-purple-500',
    text: 'text-purple-500',
  },
  orange: {
    bg: 'bg-orange-500',
    stroke: 'stroke-orange-600',
    fill: 'fill-orange-600',
    text: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-500',
    stroke: 'stroke-red-600',
    fill: 'fill-red-600',
    text: 'text-red-600',
  },
  yellow: {
    bg: 'bg-yellow-500',
    stroke: 'stroke-yellow-600',
    fill: 'fill-yellow-600',
    text: 'text-yellow-600',
  },
  cyan: {
    bg: 'bg-cyan-500',
    stroke: 'stroke-cyan-600',
    fill: 'fill-cyan-600',
    text: 'text-cyan-600',
  },
  indigo: {
    bg: 'bg-indigo-500',
    stroke: 'stroke-indigo-600',
    fill: 'fill-indigo-600',
    text: 'text-indigo-600',
  },
  magenta: {
    bg: 'bg-fuchsia-500',
    stroke: 'stroke-pink-600',
    fill: 'fill-pink-600',
    text: 'text-pink-600',
  },
  fuchsia: {
    bg: 'bg-fuchsia-400',
    stroke: 'stroke-fuchsia-500',
    fill: 'fill-fuchsia-500',
    text: 'text-fuchsia-500',
  },
  violet: {
    bg: 'bg-violet-500',
    stroke: 'stroke-violet-600',
    fill: 'fill-violet-600',
    text: 'text-violet-600',
  },
  lime: {
    bg: 'bg-lime-500',
    stroke: 'stroke-lime-600',
    fill: 'fill-lime-600',
    text: 'text-lime-600',
  },
  gray: {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-600',
    fill: 'fill-gray-600',
    text: 'text-gray-600',
  },
  teal: {
    bg: 'bg-teal-500',
    stroke: 'stroke-teal-600',
    fill: 'fill-teal-600',
    text: 'text-teal-600',
  },
  amber: {
    bg: 'bg-amber-500',
    stroke: 'stroke-amber-600',
    fill: 'fill-amber-600',
    text: 'text-amber-600',
  },
  rose: {
    bg: 'bg-rose-500',
    stroke: 'stroke-rose-600',
    fill: 'fill-rose-600',
    text: 'text-rose-600',
  },
  sky: {
    bg: 'bg-sky-500',
    stroke: 'stroke-sky-600',
    fill: 'fill-sky-600',
    text: 'text-sky-600',
  },
  emerald: {
    bg: 'bg-emerald-500',
    stroke: 'stroke-emerald-600',
    fill: 'fill-emerald-600',
    text: 'text-emerald-600',
  },
  coral: {
    bg: 'bg-coral-500',
    stroke: 'stroke-coral-600',
    fill: 'fill-coral-600',
    text: 'text-coral-600',
  },
  mint: {
    bg: 'bg-mint-500',
    stroke: 'stroke-mint-600',
    fill: 'fill-mint-600',
    text: 'text-mint-600',
  },
};

export const chartColors: Record<
  keyof typeof chartColorSchemeMap,
  Record<ColorUtility, string>
> = chartColorSchemeMap;

export type AvailableChartColorsKeys = keyof typeof chartColors;

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors,
) as Array<AvailableChartColorsKeys>;

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[],
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>();
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length]);
  });
  return categoryColors;
};

export const getColorClassName = (
  color: AvailableChartColorsKeys,
  type: ColorUtility,
): string => {
  const fallbackColor = {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-500',
    fill: 'fill-gray-500',
    text: 'text-gray-500',
  };
  return chartColors[color]?.[type] ?? fallbackColor[type];
};

// Tremor getYAxisDomain [v0.0.0]

export const getYAxisDomain = (
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined,
) => {
  const minDomain = autoMinValue ? 'auto' : (minValue ?? 0);
  const maxDomain = maxValue ?? 'auto';
  return [minDomain, maxDomain];
};

// Tremor hasOnlyOneValueForKey [v0.1.0]

export function hasOnlyOneValueForKey(
  array: any[],
  keyToCheck: string,
): boolean {
  const val: any[] = [];

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck]);
      if (val.length > 1) {
        return false;
      }
    }
  }

  return true;
}
