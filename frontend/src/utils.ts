import { toast } from 'sonner';
import { Metric, MetricType, UserRole } from './types';

export const MAXFILESIZE = 500 * 1024;
export const INTERVAL = 20000;

const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateString(length: number): string {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

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

export function formatFullName(firstname: string, lastname: string) {
  firstname =
    firstname.length > 1
      ? firstname[0].toUpperCase() + firstname.slice(1)
      : firstname.toUpperCase();
  lastname =
    lastname.length > 1
      ? lastname[0].toUpperCase() + lastname.slice(1)
      : lastname.toUpperCase();

  return firstname + ' ' + lastname;
}

export async function loadMetrics(projectid: string): Promise<Metric[]> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/metrics?projectid=' + projectid,
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

    for (let i = 0; i < json.length; i++) {
      const namepos = json[i].namepos;
      const nameneg = json[i].nameneg;

      if (json[i].filters === null) continue;
      const filterCategories = Object.keys(json[i].filters);

      for (let j = 0; j < filterCategories.length; j++) {
        for (let k = 0; k < json[i].filters[filterCategories[j]].length; k++) {
          json[i].filters[filterCategories[j]][k].namepos = namepos;
          json[i].filters[filterCategories[j]][k].nameneg = nameneg;
        }
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

export const fetchChartData = async (
  date: Date,
  range: number,
  metric: Metric,
  projectid: string,
  chartType: 'trend' | 'overview',
): Promise<any[]> => {
  const tmpData: any[] = [];
  if (!date) {
    return [];
  }

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

  if (range === 1) {
    if (chartType === 'trend') {
      dataLength = 24 * 3;
    } else {
      dataLength = 24;
    }
  } else if (range === 7) {
    if (chartType === 'trend') {
      dataLength = range * 3;
    } else {
      dataLength = range;
    }
  } else if (range >= 365) {
    dataLength = 12;
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
      data[metric.type !== MetricType.Dual ? metric.name : metric.namepos] = 0;
      if (metric.type === MetricType.Dual) {
        data[metric.nameneg] = 0;
      }
    }
    tmpData.push(data);
    if (range === 1) {
      if (chartType === 'trend') {
        dateCounter.setMinutes(dateCounter.getMinutes() + 20);
      } else {
        dateCounter.setHours(dateCounter.getHours() + 1);
      }
    } else if (range === 7) {
      if (chartType === 'trend') {
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
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?metricid=${metric.id}&projectid=${projectid}&start=${from.toISOString()}&end=${to.toISOString()}`,
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
            if (range === 1) {
              matches =
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear() &&
                eventDate.getHours() === tmpData[j].date.getHours();
              if (chartType === 'trend') {
                matches =
                  matches &&
                  eventDate.getMinutes() === tmpData[j].date.getMinutes();
              }
            } else if (range === 7) {
              matches =
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear();
              if (chartType === 'trend') {
                matches =
                  matches &&
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
              if (metric.type === MetricType.Average) {
                const current_average = tmpData[j][metric.name] ?? 0;
                const current_eventcount = tmpData[j]['Event Count'] ?? 0;

                tmpData[j]['Event Count'] =
                  current_eventcount + json[i].eventcount;

                tmpData[j][metric.name] =
                  (current_average * current_eventcount +
                    (json[i].valuepos - json[i].valueneg)) /
                  tmpData[j]['Event Count'];
                if (tmpData[j]['+'] === undefined) tmpData[j]['+'] = 0;
                if (tmpData[j]['-'] === undefined) tmpData[j]['-'] = 0;
                tmpData[j]['+'] += json[i].valuepos;
                tmpData[j]['-'] += json[i].valueneg;
              } else {
                tmpData[j][
                  metric.type === MetricType.Base ? metric.name : metric.namepos
                ] += json[i].valuepos;
                tmpData[j][metric.nameneg] += json[i].valueneg;
              }

              tmpData[j]['Positive Trend'] = json[i].relativetotalpos;
              tmpData[j]['Negative Trend'] = json[i].relativetotalneg;
              tmpData[j]['Event Trend'] = json[i].relativeeventcount;

              if (json[i].relativeeventcount === 0) {
                tmpData[j]['Average Trend'] = 0;
              } else {
                tmpData[j]['Average Trend'] =
                  (json[i].relativetotalpos - json[i].relativetotalneg) /
                  json[i].relativeeventcount;
              }
            }
          }
        }
      }
    });

  let lastDate = undefined;

  for (let i = 0; i < tmpData.length; i++) {
    tmpData[i].tooltiplabel = parseXAxis(tmpData[i].date, range);
    // if ((range === 1 || range === 7) && chartType === 'trend') {
    //   tmpData[i].tooltiplabel +=
    //     ' ' + parseXAxis(tmpData[i].date, range === 1 ? 0 : 1);
    // }

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

export const fetchNextEvent = async (
  projectid: string,
  metricid: string,
  start?: Date,
): Promise<{
  pos: number;
  neg: number;
  eventcount: number;
  relativetotalpos: number;
  relativetotalneg: number;
  relativeeventcount: number;
  results: number;
}> => {
  const from = start === undefined ? new Date() : new Date(start);
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);
  from.setMilliseconds(0);

  const to = new Date(from);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?projectid=${projectid}&metricid=${metricid}&start=${from.toISOString()}&end=${to.toISOString()}&usenext=1`,
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
        let eventcount = 0;
        let relativetotalpos = 0;
        let relativetotalneg = 0;
        let relativeeventcount = 0;
        let results = 0;
        for (let i = 0; i < json.length; i++) {
          relativetotalpos = json[i].relativetotalpos;
          relativetotalneg = json[i].relativetotalneg;
          relativeeventcount = json[i].relativeeventcount;

          pos += json[i].valuepos;
          neg += json[i].valueneg;
          eventcount += json[i].eventcount;

          results += 1;
        }
        return {
          pos,
          neg,
          eventcount,
          relativetotalpos,
          relativetotalneg,
          relativeeventcount,
          results,
        };
      }
    }
  }
  return {
    pos: 0,
    neg: 0,
    eventcount: 0,
    relativetotalpos: 0,
    relativetotalneg: 0,
    relativeeventcount: 0,
    results: 0,
  };
};

export const fetchEventVariation = async (
  projectid: string,
  metricid: string,
  startDate?: Date,
  endDate?: Date,
): Promise<{
  pos: number;
  neg: number;
  relativetotalpos: number;
  relativetotalneg: number;
  relativeeventcount: number;
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
    `${process.env.NEXT_PUBLIC_API_URL}/daily-variation?projectid=${
      projectid
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
    if (json != null) {
      let pos = 0;
      let neg = 0;
      let averagepercentdiff = 0;
      let relativetotalpos = 0;
      let relativetotalneg = 0;
      let relativeeventcount = 0;

      if (json.length > 1) {
        pos =
          json[1].relativetotalpos -
          (json[0].relativetotalpos - json[0].valuepos);
        neg =
          json[1].relativetotalneg -
          (json[0].relativetotalneg - json[0].valueneg);
        relativetotalpos = json[1].relativetotalpos;
        relativetotalneg = json[1].relativetotalneg;
        relativeeventcount = json[1].relativeeventcount;

        let lastAverage =
          (json[1].relativetotalpos - json[1].relativetotalneg) /
          json[1].relativeeventcount;
        let firstAverage =
          (json[0].relativetotalpos -
            json[0].valuepos -
            (json[0].relativetotalneg - json[0].valueneg)) /
          (json[0].relativeeventcount - json[0].eventcount);

        if (json[1].relativeeventcount === 0) lastAverage = 0;
        if (json[0].relativeeventcount - json[0].eventcount === 0)
          firstAverage = 0;

        const diff = lastAverage - firstAverage;
        console.log(lastAverage);

        if (diff !== 0 && firstAverage === 0) {
          if (diff < 0) {
            averagepercentdiff = -100;
          } else {
            averagepercentdiff = 100;
          }
        } else if (firstAverage !== 0) {
          averagepercentdiff = (diff / firstAverage) * 100;
        }
      } else if (json.length > 0) {
        pos = json[0].valuepos;
        neg = json[0].valueneg;
        relativetotalpos = json[0].relativetotalpos;
        relativetotalneg = json[0].relativetotalneg;
        relativeeventcount = json[0].relativeeventcount;

        let lastAverage =
          (json[0].relativetotalpos - json[0].relativetotalneg) /
          json[0].relativeeventcount;
        let firstAverage =
          (json[0].relativetotalpos -
            json[0].valuepos -
            (json[0].relativetotalneg - json[0].valueneg)) /
          (json[0].relativeeventcount - json[0].eventcount);

        if (json[0].relativeeventcount === 0) lastAverage = 0;
        if (json[0].relativeeventcount - json[0].eventcount === 0)
          firstAverage = 0;

        const diff = lastAverage - firstAverage;

        if (diff !== 0 && firstAverage === 0) {
          if (diff < 0) {
            averagepercentdiff = -100;
          } else {
            averagepercentdiff = 100;
          }
        } else if (firstAverage !== 0) {
          averagepercentdiff = (diff / firstAverage) * 100;
        }
      }

      return {
        pos,
        neg,
        relativetotalpos,
        relativetotalneg,
        relativeeventcount,
        averagepercentdiff,
        results: json.length,
      };
    }
  }
  return {
    pos: 0,
    neg: 0,
    relativetotalpos: 0,
    relativetotalneg: 0,
    relativeeventcount: 0,
    averagepercentdiff: 0,
    results: 0,
  };
};

export const calculateTrend = (
  data: any[],
  metric: Metric | null | undefined,
  totalpos: number,
  totalneg: number,
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
      totalpos =
        trend[i]['Positive Trend'] -
        trend[i][
          metric.type !== MetricType.Dual ? metric.name : metric.namepos
        ];
      totalneg = trend[i]['Negative Trend'] - (trend[i][metric.nameneg] ?? 0);

      if (metric.type === MetricType.Average) {
        trend[i][metric.name] = trend[i]['Average Trend'];
      } else {
        trend[i][metric.name] =
          trend[i]['Positive Trend'] - trend[i]['Negative Trend'];
      }

      const eventcount = trend[i]['Event Trend'] - trend[i]['Event Count'];
      if (eventcount === 0) {
        average = 0;
      } else {
        average = (totalpos - totalneg) / eventcount;
      }
    } else {
      if (metric.type === MetricType.Average) {
        if (trend[i][metric.name] !== undefined) {
          trend[i][metric.name] = average;
        }
      } else {
        if (
          trend[i][
            metric.type !== MetricType.Dual ? metric.name : metric.namepos
          ] !== undefined
        ) {
          trend[i][metric.name] = totalpos;
        }
        if (trend[i][metric.nameneg] !== undefined) {
          trend[i][metric.name] -= totalneg;
        }
      }
    }
  }

  return trend;
};

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
