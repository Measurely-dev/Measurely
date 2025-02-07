import { toast } from "sonner";
import {
  ChartPoint,
  Filter,
  Metric,
  MetricEvent,
  MetricType,
  UserRole,
} from "./types";
import { ChangeEvent, useState } from "react";

/**
 * Constants
 */
export const MAXFILESIZE = 500 * 1024; // 500KB max file size
export const INTERVAL = 20000; // 20 second interval

export type ChartPrecision = "D" | "W" | "15D" | "M" | "Y";

const ALPHA_NUM_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generates a random alphanumeric string of specified length
 */
export function generateString(length: number): string {
  let result = "";
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
    [UserRole.Owner]: "Owner",
    [UserRole.Admin]: "Admin",
    [UserRole.Developer]: "Developer",
    [UserRole.Guest]: "Guest",
  };
  return roleMap[role] || "";
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
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  if (!res.ok) return [];

  const json = await res.json();
  if (!json) return [];

  // Apply names to nested filters
  return json;
}

// Cached day/month names
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getDaysFromDate = (date: Date) => DAYS[date.getDay()];
export const getMonthsFromDate = (date: Date) => MONTHS[date.getMonth()];

export const fetchMetricEvents = async (
  start: Date,
  end: Date,
  metric: Metric,
  project_id: string,
): Promise<MetricEvent[]> => {
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);

  const eventsRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?metric_id=${metric.id}&project_id=${project_id}&start=${start.toISOString()}&end=${end.toISOString()}`,
    { method: "GET", credentials: "include" },
  );

  if (!eventsRes.ok) {
    const errText = await eventsRes.text();
    toast.error(errText);
    return [];
  }

  const events: MetricEvent[] | null = await eventsRes.json();
  if (!events) return [];
  events.forEach((event) => {
    if (!event.filters) event.filters = [];
  });
  return events;
};

/**
 * Fetches and processes chart data based on date range and metric type
 */
export const processMetricEvents = (
  filter_id: string | null,
  metricEvents: MetricEvent[],
  chart_type: "event" | "trend",
  precision: ChartPrecision,
  from: Date,
  metric: Metric,
): ChartPoint[] => {
  // Calculate data points
  let data_length = 0;
  switch (precision) {
    case "D":
      data_length = 24;
      break;
    case "W":
      data_length = 14;
      break;
    case "15D":
      data_length = 15;
      break;
    case "M":
      data_length = 30;
      break;
    case "Y":
      data_length = 24;
      break;
  }

  // Initialize data array
  const now = new Date();
  const dateCounter = new Date(from);
  dateCounter.setHours(0);
  dateCounter.setMinutes(0);
  dateCounter.setSeconds(0);
  dateCounter.setMilliseconds(0);

  const chartData: ChartPoint[] = [];
  const unit = getUnit(metric.unit);

  for (let i = 0; i < data_length; i++) {
    const eventDate = new Date(dateCounter);
    const point: ChartPoint = {
      date: eventDate,
      metadata: {
        tooltipdate:
          parseXAxis(eventDate, precision) +
          ` ${precision === "W" ? eventDate.getHours() + " H" : ""}`,
        [`metric_unit_${metric.name}`]: unit,
      },
    };

    if (eventDate <= now) {
      point[metric.name] = 0;
      if (metric.type === MetricType.Dual) {
        point[metric.name_pos] = 0;
        point[metric.name_neg] = 0;
      }
    }

    chartData.push(point);

    // Increment date based on range
    if (precision === "D") {
      dateCounter.setHours(dateCounter.getHours() + 1);
    } else if (precision === "W") {
      dateCounter.setHours(dateCounter.getHours() + 12);
    } else if (precision === "M" || precision === "15D") {
      dateCounter.setDate(dateCounter.getDate() + 1);
    } else {
      dateCounter.setDate(dateCounter.getDate() + 15);
    }
  }

  let filtered_events = [];
  if (filter_id !== null) {
    filtered_events = metricEvents.filter((event) =>
      event.filters.includes(filter_id),
    );
  } else {
    filtered_events = metricEvents;
  }

  if (chart_type === "event") {
    if (metric.type === MetricType.Average) {
      processAverageChart(chartData, filtered_events, precision, metric, false);
    } else {
      processEventChart(chartData, filtered_events, precision, metric);
    }
  } else if (chart_type === "trend") {
    if (metric.type === MetricType.Average) {
      processAverageChart(chartData, filtered_events, precision, metric, true);
    } else {
      processTrendChart(chartData, filtered_events, precision, metric);
    }
  }

  let lastDate: Date | null = null;
  chartData.forEach((point) => {
    const matches =
      lastDate && datesMatch(point.date as Date, lastDate, precision);
    if (!matches) {
      lastDate = new Date(point.date);
      point.date = parseXAxis(point.date as Date, precision);
    } else {
      point.date = "";
    }
  });

  return chartData;
};

const processEventChart = (
  chartData: ChartPoint[],
  metricEvents: MetricEvent[],
  precision: ChartPrecision,
  metric: Metric,
) => {
  metricEvents.forEach((event) => {
    const event_date = new Date(event.date);
    chartData.forEach((point) => {
      if (datesMatch(point.date as Date, event_date, precision)) {
        if (metric.type === MetricType.Dual) {
          point[metric.name_pos] += event.value_pos;
          point[metric.name_neg] += event.value_neg;
        }

        point[metric.name] += event.value_pos - event.value_neg;
      }
    });
  });
};

const processTrendChart = (
  chartData: ChartPoint[],
  metricEvents: MetricEvent[],
  precision: ChartPrecision,
  metric: Metric,
) => {
  let total_pos = 0;
  let total_neg = 0;
  const now = new Date();
  metricEvents.forEach((event) => {
    const event_date = new Date(event.date);
    chartData.forEach((point) => {
      if (datesMatch(point.date as Date, event_date, precision)) {
        total_pos += event.value_pos;
        total_neg += event.value_neg;
      }
      if (point.date <= now) {
        point[metric.name] = total_pos - total_neg;
        if (metric.type === MetricType.Dual) {
          point[metric.name_pos] = total_pos;
          point[metric.name_neg] = total_neg;
        }
      }
    });
  });
};

const processAverageChart = (
  chartData: ChartPoint[],
  metricEvents: MetricEvent[],
  precision: ChartPrecision,
  metric: Metric,
  isTrend: boolean,
) => {
  let total_pos = 0;
  let total_neg = 0;
  let event_count = 0;
  metricEvents.forEach((event) => {
    const event_date = new Date(event.date);
    chartData.forEach((point) => {
      if (datesMatch(point.date as Date, event_date, precision)) {
        total_pos += event.value_pos;
        total_neg += event.value_neg;
        event_count += 1;
      }
      point[metric.name] =
        event_count === 0 ? 0 : (total_pos - total_neg) / event_count;
      if (!isTrend) {
        total_pos = 0;
        total_neg = 0;
        event_count = 0;
      }
    });
  });
};

/**
 * Helper to check if dates match based on range
 */
function datesMatch(d1: Date, d2: Date, precision: ChartPrecision): boolean {
  if (precision === "D") {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear() &&
      d1.getHours() === d2.getHours()
    );
  }

  if (precision === "W") {
    const isSame12HourPeriod =
      Math.floor(d1.getHours() / 12) === Math.floor(d2.getHours() / 12); // 0 for AM, 1 for PM
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear() &&
      isSame12HourPeriod
    );
  }

  if (precision === "M" || precision === "15D") {
    return (
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear() &&
      d1.getDate() === d2.getDate()
    );
  }

  if (precision === "Y") {
    const isSame15DayPeriod =
      Math.floor((d1.getDate() - 1) / 15) ===
      Math.floor((d2.getDate() - 1) / 15); // 0 for days 1–15, 1 for 16–end
    return (
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear() &&
      isSame15DayPeriod
    );
  }

  return false;
}

/**
 * Formats date for X-axis display
 */
export const parseXAxis = (value: Date, precision: ChartPrecision): string => {
  if (precision === "D") return `${value.getHours()} H`;
  if (precision === "W") return `${getDaysFromDate(value)}`;
  if (precision === "M" || precision === "15D")
    return `${getMonthsFromDate(value)} ${value.getDate()}`;
  if (precision === "Y") {
    return `${getMonthsFromDate(value)} ${value.getDate()}`;
  }
  return "";
};

/**
 * Formats numbers for display
 */
export const valueFormatter = (number: number): string => {
  return Intl.NumberFormat("us").format(number);
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
  cycle: "month" | "year",
): number {
  let n = 0;
  const baseQuantity = 10000;

  if (plan === "plus") {
    n = 0.41;
  } else if (plan === "pro") {
    n = 0.378;
  }

  const k = basePrice / Math.pow(baseQuantity, n);

  let price = k * Math.pow(quantity, n);

  if (cycle === "year") {
    price *= 0.8;
  }

  return Math.round(price * 100) / 100;
}

// Maps slider values to event amounts for display
export function getEventAmount(value: number): string {
  const valueMap: Record<number, string> = {
    0: "10K",
    10: "50K",
    20: "100K",
    30: "250K",
    40: "500K",
    50: "1M",
    60: "2M",
    70: "4M",
    80: "6M",
    90: "8M",
    100: "10M",
  };
  return valueMap[value] || "N/A";
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
    if (!res.ok) throw new Error("Failed to fetch image");

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { props: { blurDataURL: `data:image/jpeg;base64,${base64}` } };
  } catch (error) {
    console.error("Error generating placeholder:", error);
    return { props: { blurDataURL: "frontend/public/opengraph.png" } };
  }
}

export const parseFilterList = (filters: Record<string, Filter>) => {
  const output: Record<string, { id: string; name: string }[]> = {};

  for (const id in filters) {
    const { name, category } = filters[id];
    if (!output[category]) {
      output[category] = [];
    }
    output[category].push({ id, name });
  }

  return output;
};

export const calculateEventUpdate = (
  events: MetricEvent[],
  metric: Metric,
): number => {
  if (!metric) return 0;
  let total_update = 0;

  events.forEach((event) => {
    total_update += event.value_pos - event.value_neg;
  });

  const previous_total = metric.total_pos - metric.total_neg - total_update;

  if (total_update === 0) return 0;
  if (previous_total === 0) {
    return total_update < 0 ? -100 : 100;
  }
  return Math.round((total_update / previous_total) * 100);
};

export const calculateAverageUpdate = (
  events: MetricEvent[],
  metric: Metric,
) => {
  const calculateAverage = (total: number, quantity: number): number => {
    if (quantity === 0) return 0;
    return total / quantity;
  };

  if (!metric) return 0;
  let total_update = 0;
  const event_count_update = events.length;

  events.forEach((event) => {
    total_update += event.value_pos - event.value_neg;
  });

  const previous_total = metric.total_pos - metric.total_neg - total_update;
  const previous_event_count = metric.event_count - event_count_update;
  const previous_average = calculateAverage(
    previous_total,
    previous_event_count,
  );
  const current_average = calculateAverage(
    metric.total_pos - metric.total_neg,
    metric.event_count,
  );

  const average_update = current_average - previous_average;

  if (average_update === 0) return 0;
  if (previous_average === 0) {
    return average_update < 0 ? -100 : 100;
  }
  return Math.round((average_update / previous_average) * 100);
};

type UseCharacterLimitProps = {
  maxLength: number;
  initialValue?: string;
};

export function useCharacterLimit({
  maxLength,
  initialValue = "",
}: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue);
  const [characterCount, setCharacterCount] = useState(initialValue.length);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
      setCharacterCount(newValue.length);
    }
  };

  return {
    value,
    characterCount,
    handleChange,
    maxLength,
  };
}
