import { toast } from 'sonner';
import { Application, Group, GroupType } from './types';

export const MAXFILESIZE = 500 * 1024;

export async function loadMetricsGroups(appid: string) {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/metric-groups?appid=' + appid,
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
    for (let i = 0; i < json.length; i++) {
      for (let j = 0; j < json[i].metrics.length; j++) {
        json[i].metrics[j].events = null;
      }
    }

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
  group: Group,
  application: Application,
) => {
  const tmpData: any[] = [];
  if (!date) {
    return;
  }

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  const from = date;
  const to = new Date();
  to.setDate(from.getDate() + range);

  const dateCounter = new Date(from);
  const dataLength = range === 0 ? 24 : range;
  const now = new Date();
  for (let i = 0; i < dataLength; i++) {
    const eventDate = new Date(dateCounter);
    tmpData.push({
      date: eventDate,
    });
    if (eventDate <= now) {
      tmpData[tmpData.length - 1][
        group.type === GroupType.Base ? group.name : group.metrics[0].name
      ] = 0;
      if (group.type !== GroupType.Base) {
        tmpData[tmpData.length - 1][group.metrics[1].name] = 0;
      }
    }
    if (range === 0) dateCounter.setHours(dateCounter.getHours() + 1);
    else dateCounter.setDate(dateCounter.getDate() + 1);
  }

  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?groupid=${group.id}&metricid=${group.metrics[0].id}&appid=${application.id}&start=${from.toUTCString()}&end=${to.toUTCString()}`,
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
            if (
              eventDate.getDate() === tmpData[j].date.getDate() &&
              eventDate.getMonth() === tmpData[j].date.getMonth() &&
              eventDate.getFullYear() === tmpData[j].date.getFullYear()
            ) {
              if (range === 0) {
                if (eventDate.getHours() === tmpData[j].date.getHours()) {
                  tmpData[j][
                    group.type === GroupType.Base
                      ? group.name
                      : group.metrics[0].name
                  ] += json[i].value;
                }
              } else {
                tmpData[j][
                  group.type === GroupType.Base
                    ? group.name
                    : group.metrics[0].name
                ] += json[i].value;
              }
            }
          }
        }
      }
    });
  if (group.type === GroupType.Dual) {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?groupid=${group.id}&metricid=${group.metrics[1].id}&appid=${application.id}&start=${from.toUTCString()}&end=${to.toUTCString()}`,
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
              if (
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear()
              ) {
                if (range === 0) {
                  if (eventDate.getHours() === tmpData[j].date.getHours()) {
                    tmpData[j][group.metrics[1].name] += json[i].value;
                  }
                } else {
                  tmpData[j][group.metrics[1].name] += json[i].value;
                }
              }
            }
          }
        }
      });
  }

  for (let i = 0; i < tmpData.length; i++) {
    tmpData[i].date = parseXAxis(tmpData[i].date, range);
  }

  console.log(tmpData);
  return tmpData;
};

export const parseXAxis = (value: Date, range: number) => {
  if (range === 0) {
    return value.getHours().toString() + ' H';
  } else {
    return getMonthsFromDate(value) + ', ' + value.getDate().toString();
  }
};

export const calculateTrend = (
  data: any[],
  total: number,
  positiveName: string,
  negativeName: string,
): any[] => {
  const trendData: any[] = [];
  let currentTotal = total;
  if (
    data[data.length - 1][positiveName] !== undefined &&
    data[data.length - 1][negativeName] !== undefined
  ) {
    trendData.push({
      date: data[data.length - 1].date,
      value: currentTotal,
    });
    currentTotal =
      currentTotal -
      data[data.length - 1][positiveName] +
      data[data.length - 1][negativeName];
  } else {
    trendData.push({
      date: data[data.length - 1].date,
    });
  }

  for (let i = data.length - 2; i >= 0; i--) {
    if (
      data[i][positiveName] !== undefined &&
      data[i][negativeName] !== undefined
    ) {
      trendData.push({
        date: data[i].date,
        value: currentTotal,
      });
      currentTotal =
        currentTotal - data[i][positiveName] + data[i][negativeName];
    } else {
      trendData.push({
        date: data[i].date,
      });
    }
  }
  const reversedArray = trendData.reverse();

  return reversedArray;
};
