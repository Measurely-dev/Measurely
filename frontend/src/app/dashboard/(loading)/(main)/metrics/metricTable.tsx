import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppsContext } from "@/dashContext";
import { Group, GroupType } from "@/types";
import { useContext, useEffect, useState } from "react";
import { AlertCircle, Box, MoreHorizontal } from "react-feather";
import { formatDistanceToNow } from "date-fns";
import MetricDropdown from "@/components/dashboard/components/metricDropdown";
import Empty from "@/components/dashboard/components/empty";
import MetricInformations from "./metricInfo";

const formattedDate = (date: Date) => {
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
};

function sortbyDate(a: Group, b: Group, order: string): number {
  if (a.created < b.created) {
    return order === "new" ? 1 : -1;
  } else if (a.created > b.created) {
    return order === "new" ? -1 : 1;
  } else {
    return 0;
  }
}

function sortByTotal(a: Group, b: Group): number {
  let aTotal = 0;
  let bTotal = 0;

  if (a.type === GroupType.Base) {
    aTotal = a.metrics[0].total;
  } else if (a.type === GroupType.Dual) {
    aTotal = a.metrics[0].total - a.metrics[1].total;
  }

  if (b.type === GroupType.Base) {
    bTotal = b.metrics[0].total;
  } else if (b.type === GroupType.Dual) {
    bTotal = b.metrics[0].total - b.metrics[1].total;
  }

  if (aTotal < bTotal) {
    return 1;
  } else if (aTotal > bTotal) {
    return -1;
  } else {
    return 0;
  }
}

export default function MetricTable(props: { search: string; filter: string }) {
  const { applications, activeApp } = useContext(AppsContext);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(
      applications?.[activeApp].groups
        ?.sort((a, b) => {
          if (props.filter === "new" || props.filter === "old") {
            return sortbyDate(a, b, props.filter);
          } else if (props.filter === "total") {
            return sortByTotal(a, b);
          } else {
            return 0;
          }
        })
        .filter((group) =>
          group.name.toLowerCase().includes(props.search.toLowerCase())
        ) ?? []
    );
  }, [activeApp, props.filter, props.search, applications]);

  return (
    <div className="flex flex-col gap-[15px]">
      {/* Header component for the table UI */}
      <Header />
      <div className="flex flex-col gap-2">
        {/* Items components */}
        {groups.length === 0 ? (
          <Empty>
            <AlertCircle className="size-10" />
            <div className="flex flex-col items-center gap-3 text-center">
              No metric found with that name
            </div>
          </Empty>
        ) : (
          <>
            {groups.map((group, i) => {
              return <Item key={group.metrics[0].id} group={group} index={i} />;
            })}
          </>
        )}
      </div>
    </div>
  );
}
function Header() {
  return (
    <div className="grid w-full grid-cols-[1.4fr,1.1fr,200px,175px,75px] gap-[10px] rounded-[12px] bg-accent px-5 py-3 text-xs uppercase text-secondary">
      <div>metric</div>
      <div>total value</div>
      <div>daily update</div>
      <div className="text-end">Created At</div>
    </div>
  );
}
const Item = (props: { group: Group; index: number }) => {
  const [dailyUpdate, setDailyUpdate] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const { applications, activeApp, setApplications } = useContext(AppsContext);

  const todayBadgeColor = (v: number | null) => {
    if (v === null || v === 0) {
      return "";
    } else {
      if (v > 0) {
        return "bg-green-100 text-green-600";
      } else {
        return "bg-red-100 text-red-600";
      }
    }
  };

  const todayBadgeSign = (v: number | null) => {
    if (v === null || v === 0 || v < 0) {
      return "";
    } else {
      if (v > 0) {
        return "+";
      }
    }
  };

  const fetchDailySummary = async (
    groupid: string,
    metricid: string
  ): Promise<number> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?appid=${
        applications?.[activeApp].id
      }&groupid=${groupid}&metricid=${metricid}&start=${Date.now()}&end=${Date.now()}&daily=0`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      const json = await res.json();
      if (json != null) {
        if (json.length > 0) {
          return json[0].value;
        }
      }
    }
    return 0;
  };

  const load = async () => {
    if (props.group.metrics.length === 0) {
      return;
    }

    let daily = 0;
    if (props.group.type === GroupType.Base) {
      setTotal(props.group.metrics[0].total);
      daily = await fetchDailySummary(
        props.group.id,
        props.group.metrics[0].id
      );
    } else if (props.group.type === GroupType.Dual) {
      setTotal(props.group.metrics[0].total - props.group.metrics[1].total);
      const pos = await fetchDailySummary(
        props.group.id,
        props.group.metrics[0].id
      );
      const neg = await fetchDailySummary(
        props.group.id,
        props.group.metrics[1].id
      );
      daily = pos - neg;
    }

    setDailyUpdate(daily);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="relative">
      <MetricInformations group={props.group} total={total ?? 0}>
        <div className="transition-all duration-200 absolute w-full h-full rounded-[12px] cursor-pointer z-10 hover:bg-accent opacity-50" />
      </MetricInformations>
      <div
        className={`grid h-[50px] w-full z select-none grid-cols-[1.4fr,1.1fr,200px,175px,75px] gap-[10px] rounded-[12px] px-5 relative`}
      >
        <div className="flex flex-row items-center gap-[10px] text-[15px] ">
          <div className="bg-accent p-2 rounded-full border border-input/50">
            <Box className="size-5 text-blue-500" />
          </div>
          <></>
          {props.group.name}
        </div>
        <div className="my-auto line-clamp-1 h-fit w-full text-[15px] place-items-center items-center font-mono">
          {total === null ? "LOADING..." : total}
        </div>
        <div className="flex items-center">
          <Badge
            className={`pointer-events-none h-fit w-fit rounded-[6px] bg-zinc-500/10 font-medium text-zinc-500 shadow-none ${todayBadgeColor(
              dailyUpdate
            )}}`}
          >
            {todayBadgeSign(dailyUpdate)}
            {dailyUpdate === null ? "LOADING..." : dailyUpdate}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-secondary justify-end font-light">
          {formattedDate(props.group.created)}
        </div>
        <div className="h-full flex justify-end items-center w-full">
          <MetricDropdown group={props.group} total={total ?? 0}>
            <Button
              className="rounded-[12px] !bg-transparent z-20"
              variant={"secondary"}
              size={"icon"}
            >
              <MoreHorizontal />
            </Button>
          </MetricDropdown>
        </div>
      </div>
    </div>
  );
};
