import { toast } from 'sonner';
import { Metric, MetricType, UserRole } from './types';

// Constants for file size and interval timing
export const MAXFILESIZE = 500 * 1024; // 500KB max file size
export const INTERVAL = 20000; // 20 second interval

// Character set for random string generation
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Generates a random string of specified length
export function generateString(length: number): string {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Converts UserRole enum to display string
export function roleToString(role: UserRole): string {
  switch (role) {
    case UserRole.Owner:
      return 'Owner';
    case UserRole.Admin:
      return 'Admin';
    case UserRole.Developer:
      return 'Developer';
    case UserRole.Guest:
      return 'Guest';
    default:
      return '';
  }
}

// Formats first and last name with proper capitalization
export function formatFullName(first_name: string, last_name: string) {
  first_name = first_name.length > 1
    ? first_name[0].toUpperCase() + first_name.slice(1)
    : first_name.toUpperCase();
  last_name = last_name.length > 1
    ? last_name[0].toUpperCase() + last_name.slice(1)
    : last_name.toUpperCase();
  return first_name + ' ' + last_name;
}

// Loads metrics data for a given project
export async function loadMetrics(project_id: string): Promise<Metric[]> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/metrics?project_id=' + project_id,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  );
  if (res.ok) {
    const json = await res.json();
    if (json === null) return [];

    // Process metrics data and apply names to filters
    for (let i = 0; i < json.length; i++) {
      const name_pos = json[i].name_pos;
      const name_neg = json[i].name_neg;

      if (json[i].filters === null) continue;
      const filterCategories = Object.keys(json[i].filters);

      for (let j = 0; j < filterCategories.length; j++) {
        for (let k = 0; k < json[i].filters[filterCategories[j]].length; k++) {
          json[i].filters[filterCategories[j]][k].name_pos = name_pos;
          json[i].filters[filterCategories[j]][k].name_neg = name_neg;
        }
      }
    }
    return json;
  }
  return [];
}

// Helper function to get day name from date
export const getDaysFromDate = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

// Helper function to get month name from date
export const getMonthsFromDate = (date: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getMonth()];
};

// Fetches and processes chart data based on date range and metric type
export const fetchChartData = async (
  date: Date,
  range: number,
  metric: Metric,
  project_id: string,
  chart_type: 'trend' | 'overview',
): Promise<any[]> => {
  const tmpData: any[] = [];
  if (!date) return [];

  // Initialize date range
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const from = new Date(date);
  const to = new Date(date);
  to.setDate(to.getDate() + range - 1);
  to.setHours(23);
  to.setMinutes(59);
  to.setSeconds(59);

  const dateCounter = new Date(from);
  let dataLength = 0;

  // Calculate data points based on range and chart type
  if (range === 1) {
    dataLength = chart_type === 'trend' ? 24 * 3 : 24;
  } else if (range === 7) {
    dataLength = chart_type === 'trend' ? range * 3 : range;
  } else if (range >= 365) {
    dataLength = 12;
  } else {
    dataLength = range;
  }

  // Initialize data array
  const now = new Date();

  let unitValue = '';
  const symbol = metric.unit.split('(');
  if (symbol.length > 1) {
    unitValue = symbol[1].split(')')[0];
  } else {
    unitValue = symbol[0];
  }

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

    // Increment date counter based on range
    if (range === 1) {
      if (chart_type === 'trend') {
        dateCounter.setMinutes(dateCounter.getMinutes() + 20);
      } else {
        dateCounter.setHours(dateCounter.getHours() + 1);
      }
    } else if (range === 7) {
      if (chart_type === 'trend') {
        dateCounter.setHours(dateCounter.getHours() + 8);
      } else {
        dateCounter.setDate(dateCounter.getDate() + 1);
      }
    } else if (range >= 365) {
      dateCounter.setMonth(dateCounter.getMonth() + 1);
    } else {
      dateCounter.setDate(dateCounter.getDate() + 1);
    }
  }

  // Fetch and process event data
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?metric_id=${metric.id}&project_id=${project_id}&start=${from.toISOString()}&end=${to.toISOString()}`,
    { method: 'GET', credentials: 'include' },
  )
    .then((resp) => {
      if (!resp.ok) {
        resp.text().then((text) => {
          toast.error(text);
        });
      } else {
        return resp.json();
      }
    })
    .then((json) => {
      if (json !== null && json !== undefined) {
        for (let i = 0; i < json.length; i++) {
          const eventDate = new Date(json[i].date);
          for (let j = 0; j < tmpData.length; j++) {
            let matches = false;

            // Match event dates based on range
            if (range === 1) {
              matches =
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear() &&
                eventDate.getHours() === tmpData[j].date.getHours();
              if (chart_type === 'trend') {
                matches = matches && eventDate.getMinutes() === tmpData[j].date.getMinutes();
              }
            } else if (range === 7) {
              matches =
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear();
              if (chart_type === 'trend') {
                matches = matches &&
                  eventDate.getHours() >= tmpData[j].date.getHours() &&
                  eventDate.getHours() < tmpData[j].date.getHours() + 8;
              }
            } else if (range >= 365) {
              matches =
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear();
            } else {
              matches =
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear();
            }

            if (matches) {
              // Calculate metric values based on type
              if (metric.type === MetricType.Average) {
                const current_average = tmpData[j][metric.name] ?? 0;
                const current_event_count = tmpData[j]['Event Count'] ?? 0;

                tmpData[j]['Event Count'] = current_event_count + json[i].event_count;

                tmpData[j][metric.name] =
                  (current_average * current_event_count +
                    (json[i].value_pos - json[i].value_neg)) /
                  tmpData[j]['Event Count'];
                if (tmpData[j]['+'] === undefined) tmpData[j]['+'] = 0;
                if (tmpData[j]['-'] === undefined) tmpData[j]['-'] = 0;
                tmpData[j]['+'] += json[i].value_pos;
                tmpData[j]['-'] += json[i].value_neg;
              } else {
                tmpData[j][
                  metric.type === MetricType.Base ? metric.name : metric.name_pos
                ] += json[i].value_pos;
                tmpData[j][metric.name_neg] += json[i].value_neg;
              }

              // Update trend values
              tmpData[j]['Positive Trend'] = json[i].relative_total_pos;
              tmpData[j]['Negative Trend'] = json[i].relative_total_neg;
              tmpData[j]['Event Trend'] = json[i].relative_event_count;

              tmpData[j]['Average Trend'] = json[i].relative_event_count === 0 
                ? 0 
                : (json[i].relative_total_pos - json[i].relative_total_neg) / json[i].relative_event_count;
            }
          }
        }
      }
    });

  // Format dates for display
  let lastDate = undefined;
  for (let i = 0; i < tmpData.length; i++) {
    tmpData[i].tooltiplabel = parseXAxis(tmpData[i].date, range);
    let matches = false;
    if (lastDate !== undefined) {
      if (range === 1) {
        matches =
          tmpData[i].date.getDate() === lastDate.getDate() &&
          tmpData[i].date.getMonth() === lastDate.getMonth() &&
          tmpData[i].date.getFullYear() === lastDate.getFullYear() &&
          tmpData[i].date.getHours() === lastDate.getHours();
      } else if (range >= 365) {
        matches =
          tmpData[i].date.getMonth() === lastDate.getMonth() &&
          tmpData[i].date.getFullYear() === lastDate.getFullYear();
      } else if (range === 7 || range === 15 || range >= 28) {
        matches =
          tmpData[i].date.getDate() === lastDate.getDate() &&
          tmpData[i].date.getMonth() === lastDate.getMonth() &&
          tmpData[i].date.getFullYear() === lastDate.getFullYear();
      }
    }

    if (!matches) {
      lastDate = new Date(tmpData[i].date);
      tmpData[i].date = parseXAxis(tmpData[i].date, range);
    } else {
      tmpData[i].date = '';
    }
  }

  return tmpData;
};

// Fetches the next event data for a metric
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
  const from = start === undefined ? new Date() : new Date(start);
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);
  from.setMilliseconds(0);

  const to = new Date(from);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?project_id=${project_id}&metric_id=${metric_id}&start=${from.toISOString()}&end=${to.toISOString()}&use_next=1`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (res.ok) {
    const json = await res.json();
    if (json != null && json.length > 0) {
      let pos = 0;
      let neg = 0;
      let event_count = 0;
      let relative_total_pos = 0;
      let relative_total_neg = 0;
      let relative_event_count = 0;
      let results = 0;

      for (let i = 0; i < json.length; i++) {
        relative_total_pos = json[i].relative_total_pos;
        relative_total_neg = json[i].relative_total_neg;
        relative_event_count = json[i].relative_event_count;
        pos += json[i].value_pos;
        neg += json[i].value_neg;
        event_count += json[i].event_count;
        results += 1;
      }

      return {
        pos,
        neg,
        event_count,
        relative_total_pos,
        relative_total_neg,
        relative_event_count,
        results,
      };
    }
  }

  return {
    pos: 0,
    neg: 0,
    event_count: 0,
    relative_total_pos: 0,
    relative_total_neg: 0,
    relative_event_count: 0,
    results: 0,
  };
};

// Fetches event variation data between dates
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
  const start = startDate === undefined ? new Date() : startDate;
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setMilliseconds(0);

  const end = endDate === undefined ? new Date(start) : endDate;
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/daily_variation?project_id=${project_id}&metric_id=${metric_id}&start=${start.toISOString()}&end=${end.toISOString()}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (res.ok) {
    const json = await res.json();
    if (json != null) {
      let pos = 0;
      let neg = 0;
      let event_count = 0;
      let averagepercentdiff = 0;
      let relative_total_pos = 0;
      let relative_total_neg = 0;
      let relative_event_count = 0;

      if (json.length > 1) {
        // Calculate variations between two periods
        pos = json[1].relative_total_pos - (json[0].relative_total_pos - json[0].value_pos);
        neg = json[1].relative_total_neg - (json[0].relative_total_neg - json[0].value_neg);
        event_count = json[1].relative_event_count - (json[0].relative_event_count - json[0].evencount);
        relative_total_pos = json[1].relative_total_pos;
        relative_total_neg = json[1].relative_total_neg;
        relative_event_count = json[1].relative_event_count;

        const lastAverage = json[1].relative_event_count === 0 ? 0 :
          (json[1].relative_total_pos - json[1].relative_total_neg) / json[1].relative_event_count;

        const firstAverage = (json[0].relative_event_count - json[0].event_count) === 0 ? 0 :
          (json[0].relative_total_pos - json[0].value_pos - (json[0].relative_total_neg - json[0].value_neg)) /
          (json[0].relative_event_count - json[0].event_count);

        const diff = lastAverage - firstAverage;

        if (diff !== 0 && firstAverage === 0) {
          averagepercentdiff = diff < 0 ? -100 : 100;
        } else if (firstAverage !== 0) {
          averagepercentdiff = (diff / firstAverage) * 100;
        }
      } else if (json.length > 0) {
        // Single period calculations
        pos = json[0].value_pos;
        neg = json[0].value_neg;
        relative_total_pos = json[0].relative_total_pos;
        relative_total_neg = json[0].relative_total_neg;
        relative_event_count = json[0].relative_event_count;

        const lastAverage = json[0].relative_event_count === 0 ? 0 :
          (json[0].relative_total_pos - json[0].relative_total_neg) / json[0].relative_event_count;

        const firstAverage = (json[0].relative_event_count - json[0].event_count) === 0 ? 0 :
          (json[0].relative_total_pos - json[0].value_pos - (json[0].relative_total_neg - json[0].value_neg)) /
          (json[0].relative_event_count - json[0].event_count);

        const diff = lastAverage - firstAverage;

        if (diff !== 0 && firstAverage === 0) {
          averagepercentdiff = diff < 0 ? -100 : 100;
        } else if (firstAverage !== 0) {
          averagepercentdiff = (diff / firstAverage) * 100;
        }
      }

      return {
        pos,
        neg,
        event_count,
        relative_total_pos,
        relative_total_neg,
        relative_event_count,
        averagepercentdiff,
        results: json.length,
      };
    }
  }

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
};

// Calculates trend data for metrics
export const calculateTrend = (
  data: any[],
  metric: Metric | null | undefined,
  total_pos: number,
  total_neg: number,
  average: number,
): any[] => {
  if (!metric) return data;
  const trend = data.map((obj) => ({ ...obj }));

  for (let i = trend.length - 1; i >= 0; i--) {
    if (
      trend[i]['Positive Trend'] !== undefined &&
      trend[i]['Negative Trend'] !== undefined &&
      trend[i]['Event Trend'] !== undefined &&
      trend[i]['Average Trend'] !== undefined
    ) {
      total_pos = trend[i]['Positive Trend'] - trend[i][metric.type !== MetricType.Dual ? metric.name : metric.name_pos];
      total_neg = trend[i]['Negative Trend'] - (trend[i][metric.name_neg] ?? 0);

      if (metric.type === MetricType.Average) {
        trend[i][metric.name] = trend[i]['Average Trend'];
      } else {
        trend[i][metric.name] = trend[i]['Positive Trend'] - trend[i]['Negative Trend'];
      }

      const event_count = trend[i]['Event Trend'] - trend[i]['Event Count'];
      average = event_count === 0 ? 0 : (total_pos - total_neg) / event_count;
    } else {
      if (metric.type === MetricType.Average) {
        if (trend[i][metric.name] !== undefined) {
          trend[i][metric.name] = average;
        }
      } else {
        if (trend[i][metric.type !== MetricType.Dual ? metric.name : metric.name_pos] !== undefined) {
          trend[i][metric.name] = total_pos;
          trend[i]['Positive Trend'] = total_pos;
        }
        if (trend[i][metric.name_neg] !== undefined) {
          trend[i][metric.name] -= total_neg;
          trend[i]['Negative Trend'] = total_neg;
        }
      }
    }
  }

  return trend;
};

// Formats date for X-axis display
export const parseXAxis = (value: Date, range: number) => {
  if (range === 0) {
    return value.getMinutes() + ' MIN';
  } else if (range === 1) {
    return value.getHours().toString() + ' H';
  } else if (range >= 365) {
    return getMonthsFromDate(value);
  } else if (range === 7 || range === 15 || range >= 28) {
    return getMonthsFromDate(value) + ' ' + value.getDate().toString();
  }
};

// Formats numbers for display
export const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};
