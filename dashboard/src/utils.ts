import { toast } from 'sonner';
import { Metric, MetricType, UserRole } from './types';

/**
 * Constants
 */
export const MAXFILESIZE = 500 * 1024; // 500KB max file size
export const INTERVAL = 20000; // 20 second interval

const ALPHA_NUM_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a random alphanumeric string of specified length
 */
export function generateString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHA_NUM_CHARS.charAt(
      Math.floor(Math.random() * ALPHA_NUM_CHARS.length),
    );
  }
  return result;
}

/**
 * Maps UserRole enum to display string
 */
export function roleToString(role: UserRole): string {
  const roleMap = {
    [UserRole.Owner]: 'Owner',
    [UserRole.Admin]: 'Admin',
    [UserRole.Developer]: 'Developer',
    [UserRole.Guest]: 'Guest',
  };
  return roleMap[role] || '';
}

/**
 * Capitalizes first letter of first and last name
 */
export function formatFullName(first_name: string, last_name: string): string {
  const capitalize = (str: string) =>
    str.length > 1 ? str[0].toUpperCase() + str.slice(1) : str.toUpperCase();

  return `${capitalize(first_name)} ${capitalize(last_name)}`;
}

/**
 * Fetches and processes metrics data for a project
 */
export async function loadMetrics(project_id: string): Promise<Metric[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metrics?project_id=${project_id}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
  );

  if (!res.ok) return [];

  const json = await res.json();
  if (!json) return [];

  // Apply names to nested filters
  return json.map((metric: Metric) => {
    if (!metric.filters) return metric;

    const { name_pos, name_neg } = metric;
    Object.values(metric.filters).forEach((filterArr) => {
      filterArr.forEach((filter) => {
        filter.name_pos = name_pos;
        filter.name_neg = name_neg;
      });
    });
    return metric;
  });
}

// Cached day/month names
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const getDaysFromDate = (date: Date) => DAYS[date.getDay()];
export const getMonthsFromDate = (date: Date) => MONTHS[date.getMonth()];

/**
 * Fetches and processes chart data based on date range and metric type
 */
export const fetchChartData = async (
  date: Date,
  range: number,
  metric: Metric,
  project_id: string,
  chart_type: 'trend' | 'overview',
): Promise<any[]> => {
  if (!date) return [];

  // Initialize dates
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setDate(to.getDate() + range - 1);
  to.setHours(23, 59, 59);

  // Calculate data points
  const dataLength =
    range === 1
      ? chart_type === 'trend'
        ? 72
        : 24
      : range === 7
        ? chart_type === 'trend'
          ? 21
          : 7
        : range >= 365
          ? 12
          : range;

  // Initialize data array
  const now = new Date();
  const unitValue = getUnit(metric.unit);
  const tmpData: any[] = [];
  const dateCounter = new Date(from);

  for (let i = 0; i < dataLength; i++) {
    const eventDate = new Date(dateCounter);
    const data: any = {
      date: eventDate,
      [`metric_unit_${metric.name}`]: unitValue,
    };

    if (eventDate <= now) {
      data[metric.type !== MetricType.Dual ? metric.name : metric.name_pos] = 0;
      if (metric.type === MetricType.Dual) {
        data[metric.name_neg] = 0;
      }
    }
    tmpData.push(data);

    // Increment date based on range
    if (range === 1) {
      dateCounter.setMinutes(
        dateCounter.getMinutes() + (chart_type === 'trend' ? 20 : 60),
      );
    } else if (range === 7) {
      dateCounter.setHours(
        dateCounter.getHours() + (chart_type === 'trend' ? 8 : 24),
      );
    } else if (range >= 365) {
      dateCounter.setMonth(dateCounter.getMonth() + 1);
    } else {
      dateCounter.setDate(dateCounter.getDate() + 1);
    }
  }

  // Fetch events data
  try {
    const eventsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?metric_id=${metric.id}&project_id=${project_id}&start=${from.toISOString()}&end=${to.toISOString()}`,
      { method: 'GET', credentials: 'include' },
    );

    if (!eventsRes.ok) {
      const errText = await eventsRes.text();
      toast.error(errText);
      return tmpData;
    }

    const events = await eventsRes.json();
    // Process events if they exist
    if (events) {
      // Process events data
      events.forEach((event: any) => {
        const eventDate = new Date(event.date);

        tmpData.forEach((data) => {
          if (datesMatch(eventDate, data.date, range, chart_type)) {
            updateMetricValues(data, event, metric);
            updateTrendValues(data, event);
          }
        });
      });
    }
  } catch (err) {
    console.error('Error fetching events:', err);
    toast.error('Failed to fetch events data');
  }

  // Format dates for display
  let lastDate: Date | undefined = undefined;
  tmpData.forEach((data) => {
    data.tooltiplabel = parseXAxis(data.date, range);

    const matches = lastDate && datesMatch(data.date, lastDate, range);
    if (!matches) {
      lastDate = new Date(data.date);
      data.date = parseXAxis(data.date, range);
    } else {
      data.date = '';
    }
  });

  return tmpData;
};

/**
 * Helper to check if dates match based on range
 */
function datesMatch(
  d1: Date,
  d2: Date,
  range: number,
  chart_type?: 'trend' | 'overview',
): boolean {
  if (range === 1) {
    const baseMatch =
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear() &&
      d1.getHours() === d2.getHours();
    return chart_type === 'trend'
      ? baseMatch && d1.getMinutes() === d2.getMinutes()
      : baseMatch;
  }

  if (range === 7 && chart_type === 'trend') {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear() &&
      d1.getHours() >= d2.getHours() &&
      d1.getHours() < d2.getHours() + 8
    );
  }

  if (range >= 365) {
    return (
      d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
    );
  }

  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

/**
 * Helper to update metric values
 */
function updateMetricValues(data: any, event: any, metric: Metric) {
  if (metric.type === MetricType.Average) {
    const current_average = data[metric.name] ?? 0;
    const current_event_count = data['Event Count'] ?? 0;

    data['Event Count'] = current_event_count + event.event_count;
    data[metric.name] =
      (current_average * current_event_count +
        (event.value_pos - event.value_neg)) /
      data['Event Count'];

    data['+'] = (data['+'] ?? 0) + event.value_pos;
    data['-'] = (data['-'] ?? 0) + event.value_neg;
  } else {
    const metricName =
      metric.type === MetricType.Base ? metric.name : metric.name_pos;
    data[metricName] += event.value_pos;
    data[metric.name_neg] += event.value_neg;
  }
}

/**
 * Helper to update trend values
 */
function updateTrendValues(data: any, event: any) {
  data['Positive Trend'] = event.relative_total_pos;
  data['Negative Trend'] = event.relative_total_neg;
  data['Event Trend'] = event.relative_event_count;
  data['Average Trend'] =
    event.relative_event_count === 0
      ? 0
      : (event.relative_total_pos - event.relative_total_neg) /
        event.relative_event_count;
}

/**
 * Fetches next event data for a metric
 */
export const fetchNextEvent = async (
  project_id: string,
  metric_id: string,
  start?: Date,
): Promise<{
  pos: number;
  neg: number;
  event_count: number;
  relative_total_pos: number;
  relative_total_neg: number;
  relative_event_count: number;
  results: number;
}> => {
  const from = new Date(start || new Date());
  from.setHours(0, 0, 0, 0);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?project_id=${project_id}&metric_id=${metric_id}&start=${from.toISOString()}&end=${from.toISOString()}&use_next=1`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!res.ok) return defaultEventData();

    const events = await res.json();
    if (!events?.length) return defaultEventData();

    return events.reduce(
      (acc: any, event: any) => ({
        pos: acc.pos + event.value_pos,
        neg: acc.neg + event.value_neg,
        event_count: acc.event_count + event.event_count,
        relative_total_pos: event.relative_total_pos,
        relative_total_neg: event.relative_total_neg,
        relative_event_count: event.relative_event_count,
        results: acc.results + 1,
      }),
      defaultEventData(),
    );
  } catch (err) {
    console.error('Error fetching next event:', err);
    return defaultEventData();
  }
};

function defaultEventData() {
  return {
    pos: 0,
    neg: 0,
    event_count: 0,
    relative_total_pos: 0,
    relative_total_neg: 0,
    relative_event_count: 0,
    results: 0,
  };
}

/**
 * Fetches event variation data between dates
 */
export const fetchEventVariation = async (
  project_id: string,
  metric_id: string,
  startDate?: Date,
  endDate?: Date,
): Promise<{
  pos: number;
  neg: number;
  event_count: number;
  relative_total_pos: number;
  relative_total_neg: number;
  relative_event_count: number;
  averagepercentdiff: number;
  results: number;
}> => {
  const start = new Date(startDate || new Date());
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate || start);
  end.setHours(23, 59, 59);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/daily_variation?project_id=${project_id}&metric_id=${metric_id}&start=${start.toISOString()}&end=${end.toISOString()}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!res.ok) return defaultVariationData();

    const data = await res.json();
    if (!data) return defaultVariationData();

    if (data.length > 1) {
      return calculateVariationForTwoPeriods(data);
    } else if (data.length === 1) {
      return calculateVariationForSinglePeriod(data[0]);
    }

    return defaultVariationData();
  } catch (err) {
    console.error('Error fetching variation:', err);
    return defaultVariationData();
  }
};

function defaultVariationData() {
  return {
    pos: 0,
    neg: 0,
    event_count: 0,
    relative_total_pos: 0,
    relative_total_neg: 0,
    relative_event_count: 0,
    averagepercentdiff: 0,
    results: 0,
  };
}

function calculateVariationForTwoPeriods(data: any[]) {
  const [first, last] = data;
  const pos =
    last.relative_total_pos - (first.relative_total_pos - first.value_pos);
  const neg =
    last.relative_total_neg - (first.relative_total_neg - first.value_neg);
  const event_count =
    last.relative_event_count - (first.relative_event_count - first.evencount);

  const lastAverage =
    last.relative_event_count === 0
      ? 0
      : (last.relative_total_pos - last.relative_total_neg) /
        last.relative_event_count;

  const firstAverage =
    first.relative_event_count - first.event_count === 0
      ? 0
      : (first.relative_total_pos -
          first.value_pos -
          (first.relative_total_neg - first.value_neg)) /
        (first.relative_event_count - first.event_count);

  const diff = lastAverage - firstAverage;
  const averagepercentdiff =
    diff !== 0 && firstAverage === 0
      ? diff < 0
        ? -100
        : 100
      : firstAverage !== 0
        ? (diff / firstAverage) * 100
        : 0;

  return {
    pos,
    neg,
    event_count,
    relative_total_pos: last.relative_total_pos,
    relative_total_neg: last.relative_total_neg,
    relative_event_count: last.relative_event_count,
    averagepercentdiff,
    results: data.length,
  };
}

function calculateVariationForSinglePeriod(data: any) {
  const lastAverage =
    data.relative_event_count === 0
      ? 0
      : (data.relative_total_pos - data.relative_total_neg) /
        data.relative_event_count;

  const firstAverage =
    data.relative_event_count - data.event_count === 0
      ? 0
      : (data.relative_total_pos -
          data.value_pos -
          (data.relative_total_neg - data.value_neg)) /
        (data.relative_event_count - data.event_count);

  const diff = lastAverage - firstAverage;
  const averagepercentdiff =
    diff !== 0 && firstAverage === 0
      ? diff < 0
        ? -100
        : 100
      : firstAverage !== 0
        ? (diff / firstAverage) * 100
        : 0;

  return {
    pos: data.value_pos,
    neg: data.value_neg,
    event_count: data.event_count,
    relative_total_pos: data.relative_total_pos,
    relative_total_neg: data.relative_total_neg,
    relative_event_count: data.relative_event_count,
    averagepercentdiff,
    results: 1,
  };
}

/**
 * Calculates trend data for metrics by processing positive/negative trends
 * and averaging values based on metric type
 */
export const calculateTrend = (
  data: any[],
  metric: Metric | null | undefined,
  total_pos: number,
  total_neg: number,
  average: number,
): any[] => {
  if (!metric) return data;

  // Create copy of data to modify
  const trend = data.map((obj) => ({ ...obj }));

  // Process each data point from newest to oldest
  for (let i = trend.length - 1; i >= 0; i--) {
    const point = trend[i];
    const hasTrends =
      point['Positive Trend'] !== undefined &&
      point['Negative Trend'] !== undefined &&
      point['Event Trend'] !== undefined &&
      point['Average Trend'] !== undefined;

    if (hasTrends) {
      // Calculate running totals
      const metricName =
        metric.type !== MetricType.Dual ? metric.name : metric.name_pos;
      total_pos = point['Positive Trend'] - point[metricName];
      total_neg = point['Negative Trend'] - (point[metric.name_neg] ?? 0);

      // Update metric value based on type
      point[metric.name] =
        metric.type === MetricType.Average
          ? point['Average Trend']
          : point['Positive Trend'] - point['Negative Trend'];

      // Calculate new average
      const event_count = point['Event Trend'] - point['Event Count'];
      average = event_count === 0 ? 0 : (total_pos - total_neg) / event_count;
    } else {
      // Handle points without trends
      if (metric.type === MetricType.Average) {
        if (point[metric.name] !== undefined) {
          point[metric.name] = average;
        }
      } else {
        const metricName =
          metric.type !== MetricType.Dual ? metric.name : metric.name_pos;
        if (point[metricName] !== undefined) {
          point[metric.name] = total_pos;
          point['Positive Trend'] = total_pos;
        }
        if (point[metric.name_neg] !== undefined) {
          point[metric.name] -= total_neg;
          point['Negative Trend'] = total_neg;
        }
      }
    }
  }

  return trend;
};

/**
 * Formats date for X-axis display
 */
export const parseXAxis = (value: Date, range: number): string => {
  if (range === 0) return `${value.getMinutes()} MIN`;
  if (range === 1) return `${value.getHours()} H`;
  if (range >= 365) return getMonthsFromDate(value);
  if (range === 7 || range === 15 || range >= 28) {
    return `${getMonthsFromDate(value)} ${value.getDate()}`;
  }
  return '';
};

/**
 * Formats numbers for display
 */
export const valueFormatter = (number: number): string => {
  return Intl.NumberFormat('us').format(number);
};

/**
 * Extract unit from metric
 */
export const getUnit = (unit: string): string => {
  const [_, value] = unit.match(/\((.*?)\)/) || [null, unit];
  return value;
};
//
// Calculates price based on selected plan and billing period
export function calculatePrice(
  basePrice: number,
  plan: string,
  quantity: number,
  cycle: 'month' | 'year',
): number {
  console.log(cycle);
  let n = 0;
  const baseQuantity = 10000;

  if (plan === 'plus') {
    n = 0.41;
  } else if (plan === 'pro') {
    n = 0.378;
  }

  const k = basePrice / Math.pow(baseQuantity, n);

  let price = k * Math.pow(quantity, n);

  if (cycle === 'year') {
    price *= 0.8;
  }

  return Math.round(price * 100) / 100;
}

// Maps slider values to event amounts for display
export function getEventAmount(value: number): string {
  const valueMap: Record<number, string> = {
    0: '10K',
    10: '50K',
    20: '100K',
    30: '250K',
    40: '500K',
    50: '1M',
    60: '2M',
    70: '4M',
    80: '6M',
    90: '8M',
    100: '10M',
  };
  return valueMap[value] || 'N/A';
}

export function getEventCount(value: number): number {
  const valueMap: Record<number, number> = {
    0: 10000,
    10: 50000,
    20: 100000,
    30: 250000,
    40: 500000,
    50: 1000000,
    60: 2000000,
    70: 4000000,
    80: 6000000,
    90: 8000000,
    100: 10000000,
  };
  return valueMap[value] || 0;
}

// Image optimization with Plaiceholder
export async function getImagePlaceholder(url: string) {
  try {
    const res = await fetch(url); // Ensure URL is valid
    if (!res.ok) throw new Error('Failed to fetch image');

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return { props: { blurDataURL: `data:image/jpeg;base64,${base64}` } };
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return { props: { blurDataURL: 'frontend/public/opengraph.png' } };
  }
}