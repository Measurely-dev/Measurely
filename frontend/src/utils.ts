export async function loadMetricsGroups(appid: string) {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/metric-groups?appid=" + appid,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
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
