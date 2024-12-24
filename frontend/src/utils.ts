import { toast } from 'sonner';
import { Metric, MetricType } from './types';

export const MAXFILESIZE = 500 * 1024;
export const INTERVAL = 5000;

export async function loadMetrics(appid: string) {
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
) => {
  const tmpData: any[] = [];
  if (!date) {
    return;
  }

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  const from = new Date(date);
  const to = new Date(date);
  if (range === 0) to.setHours(to.getHours() + 24);
  else to.setDate(to.getDate() + range);

  const dateCounter = new Date(from);
  let dataLength = 0;

  if (range === 0) {
    dataLength = 24;
  } else if (range >= 365) {
    dataLength = 12;
  } else {
    dataLength = range;
  }

  const now = new Date();
  const useDaily = range === 0 ? '' : '&daily=1';
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
      data['total'] = null;
    }
    tmpData.push(data);
    if (range === 0) {
      dateCounter.setHours(dateCounter.getHours() + 1);
    } else if (range >= 365) {
      dateCounter.setMonth(dateCounter.getMonth() + 1);
    } else {
      dateCounter.setDate(dateCounter.getDate() + 1);
    }
  }

  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?metricid=${metric.id}&appid=${appid}&start=${from.toUTCString()}&end=${to.toUTCString()}${useDaily}`,
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
            if (range === 0) {
              matches =
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear() &&
                eventDate.getHours() === tmpData[j].date.getHours();
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
              if (range > 0) {
                tmpData[j][metric.namepos] += json[i].valuepos;
                if (metric.type === MetricType.Dual) {
                  tmpData[j][metric.nameneg] += -json[i].valueneg;
                }
              } else {
                if (json[i].value >= 0) {
                  tmpData[j][
                    metric.type === MetricType.Base
                      ? metric.name
                      : metric.namepos
                  ] += json[i].value;
                } else {
                  tmpData[j][metric.nameneg] += -json[i].value;
                }
              }

              tmpData[j]['total'] = json[i].relativetotal;
            }
          }
        }
      }
    });

  let lastTotal = 0;
  for (let i = 0; i < tmpData.length; i++) {
    if (tmpData[i]['total'] === null) {
      tmpData[i]['total'] = lastTotal;
    } else {
      lastTotal = tmpData[i]['total'];
    }
    tmpData[i].date = parseXAxis(tmpData[i].date, range);
  }

  return tmpData;
};

export const fetchDailySummary = async (
  appid: string,
  metricid: string,
): Promise<{ pos: number; neg: number }> => {
  const from = new Date();
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);
  const to = new Date(from);
  to.setHours(from.getHours() + 24);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?appid=${appid
    }&metricid=${metricid}&start=${from.toUTCString()}&end=${to.toUTCString()}&daily=1`,
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
        for (let i = 0; i < json.length; i++) {
          pos += json[i].valuepos;
          neg += -json[i].valueneg;
        }
        return { pos, neg };
      }
    }
  }
  return { pos: 0, neg: 0 };
};

export const parseXAxis = (value: Date, range: number) => {
  if (range === 0) {
    return value.getHours().toString() + ' H';
  } else if (range >= 365) {
    return getMonthsFromDate(value);
  } else {
    return getMonthsFromDate(value) + ' ' + value.getDate().toString();
  }
};
