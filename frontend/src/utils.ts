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
    return json;
  }

  return [];
}
