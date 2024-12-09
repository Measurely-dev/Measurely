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

export const mapToArray = (map: Map<any, any>, name: string = 'value') => {
  let array: any[] = [];
  map.keys().forEach((key) => {
    array.push({ date: key, [name]: map.get(key) });
  });

  return array;
};

export const multiMapsToArray = (map1: Map<any, any>, map2: Map<any, any>) => {
  // Create a Set to track all unique dates
  const uniqueDates = new Set<string>();

  // Add keys from both maps to the uniqueDates Set
  map1.keys().forEach((key) => uniqueDates.add(key));
  map2.keys().forEach((key) => uniqueDates.add(key));

  // Prepare the result array
  const array: any[] = [];

  // Populate the result array
  uniqueDates.forEach((date) => {
    array.push({
      date: date,
      positive: map1.get(date) || 0,
      negative: map2.get(date) || 0,
    });
  });

  return array;
};

export const dateToXAxis = (from: Date, to: Date, dateToParse: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (from.toString() === to.toString()) {
    return dateToParse.getHours().toString();
  } else {
    return days[dateToParse.getDay()];
  }
};
