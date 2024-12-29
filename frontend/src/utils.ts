import { toast } from 'sonner';
import { Metric, MetricType } from './types';

export const MAXFILESIZE = 500 * 1024;
export const INTERVAL = 10000;
export const INTERVAL_LONG = 20000;

export async function loadMetrics(appid: string): Promise<Metric[]> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/metrics?appid=' + appid,
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
    return json;
  }

  return [];
}

export const getDaysFromDate = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

export const getMonthsFromDate = (date: Date) => {
  const months = [
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
  return months[date.getMonth()];
};

export const loadChartData = async (
  date: Date,
  range: number,
  metric: Metric,
  appid: string,
): Promise<any[]> => {
  const tmpData: any[] = [];
  if (!date) {
    return [];
  }

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  const from = new Date(date);
  const to = new Date(date);
  to.setDate(to.getDate() + range - 1);
  to.setHours(23);
  to.setMinutes(59);
  to.setSeconds(59);

  const dateCounter = new Date(from);
  let dataLength = 0;

  if (range === 1 || range === 7) {
    dataLength = 24 * range;
  } else {
    dataLength = range;
  }

  const now = new Date();
  for (let i = 0; i < dataLength; i++) {
    const eventDate = new Date(dateCounter);
    const data: any = {
      date: eventDate,
    };
    if (eventDate <= now) {
      data[metric.type === MetricType.Base ? metric.name : metric.namepos] = 0;
      if (metric.type === MetricType.Dual) {
        data[metric.nameneg] = 0;
      }
    }
    tmpData.push(data);
    if (range === 1 || range === 7) {
      dateCounter.setHours(dateCounter.getHours() + 1);
    } else {
      dateCounter.setDate(dateCounter.getDate() + 1);
    }
  }
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?metricid=${metric.id}&appid=${appid}&start=${from.toISOString()}&end=${to.toISOString()}`,
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
            if (range === 1 || range === 7) {
              matches =
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear() &&
                eventDate.getHours() === tmpData[j].date.getHours();
            } else {
              matches =
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear();
            }

            if (matches) {
              tmpData[j][
                metric.type === MetricType.Base ? metric.name : metric.namepos
              ] += json[i].valuepos;
              tmpData[j][metric.nameneg] += json[i].valueneg;

              tmpData[j]['Positive Trend'] = json[i].relativetotalpos;
              tmpData[j]['Negative Trend'] = json[i].relativetotalneg;
            }
          }
        }
      }
    });

  for (let i = 0; i < tmpData.length; i++) {
    tmpData[i].date = parseXAxis(tmpData[i].date, range);
  }

  return tmpData;
};

export const fetchNextEvent = async (
  appid: string,
  metricid: string,
  start?: Date,
): Promise<{
  pos: number;
  neg: number;
  relativetotalpos: number;
  relativetotalneg: number;
  results: number;
}> => {
  const from = start === undefined ? new Date() : new Date(start);
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);
  const to = new Date(from);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?appid=${appid
    }&metricid=${metricid}&start=${from.toISOString()}&end=${to.toISOString()}&usenext=1`,
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
      if (json.length > 0) {
        let pos = 0;
        let neg = 0;
        let relativetotalpos = 0;
        let relativetotalneg = 0;
        let results = 0;
        for (let i = 0; i < json.length; i++) {
          relativetotalpos = json[i].relativetotalpos;
          relativetotalneg = json[i].relativetotalneg;

          pos += json[i].valuepos;
          neg += json[i].valueneg;

          results += 1;
        }
        return { pos, neg, relativetotalpos, relativetotalneg, results };
      }
    }
  }
  return {
    pos: 0,
    neg: 0,
    relativetotalpos: 0,
    relativetotalneg: 0,
    results: 0,
  };
};

export const fetchDailySummary = async (
  appid: string,
  metricid: string,
): Promise<{
  pos: number;
  neg: number;
  relativetotalpos: number;
  relativetotalneg: number;
}> => {
  const start = new Date();
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);

  const end = new Date(start);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/daily-variation?appid=${appid
    }&metricid=${metricid}&start=${start.toISOString()}&end=${end.toISOString()}`,
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
    console.log(json);
    if (json != null) {
      let pos = 0;
      let neg = 0;
      let relativetotalpos = 0;
      let relativetotalneg = 0;

      if (json.length > 1) {
        pos =
          json[1].relativetotalpos -
          (json[0].relativetotalpos - json[0].valuepos);
        neg =
          json[1].relativetotalneg -
          (json[0].relativetotalneg - json[0].valueneg);
        relativetotalpos = json[1].relativetotalpos;
        relativetotalneg = json[1].relativetotalneg;
      } else if (json.length > 0) {
        pos = json[0].valuepos;
        neg = json[0].valueneg;
        relativetotalpos = json[0].relativetotalpos;
        relativetotalneg = json[0].relativetotalneg;
      }

      return { pos, neg, relativetotalpos, relativetotalneg };
    }
  }
  return {
    pos: 0,
    neg: 0,
    relativetotalpos: 0,
    relativetotalneg: 0,
  };
};

export const calculateTrend = (
  data: any[],
  metric: Metric | null | undefined,
  totalpos: number,
  totalneg: number,
): any[] => {
  if (!metric) return data;
  const trend = [...data];
  for (let i = trend.length - 1; i >= 0; i--) {
    if (
      trend[i]['Positive Trend'] !== undefined &&
      trend[i]['Negative Trend'] !== undefined
    ) {
      totalpos =
        trend[i]['Positive Trend'] -
        trend[i][
        metric.type === MetricType.Base ? metric.name : metric.namepos
        ];
      totalneg = trend[i]['Negative Trend'] - (trend[i][metric.nameneg] ?? 0);
      trend[i]['Total'] =
        trend[i]['Positive Trend'] - trend[i]['Negative Trend'];
    } else {
      if (
        trend[i][
        metric.type === MetricType.Base ? metric.name : metric.namepos
        ] !== undefined
      ) {
        trend[i]['Positive Trend'] = totalpos;
        trend[i]['Total'] = totalpos;
      }
      if (trend[i][metric.nameneg] !== undefined) {
        trend[i]['Negative Trend'] = totalneg;
        trend[i]['Total'] -= totalneg;
      }
    }
  }
  return trend;
};

export const parseXAxis = (value: Date, range: number) => {
  if (range === 1) {
    return value.getHours().toString() + ' H';
  } else {
    return getMonthsFromDate(value) + ' ' + value.getDate().toString();
  }
};
