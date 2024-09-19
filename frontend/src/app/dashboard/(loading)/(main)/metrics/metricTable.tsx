import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppsContext } from "@/dashContext";
import { Group, GroupType, MetricEvent } from "@/types";
import { useContext, useEffect, useState } from "react";
import { Box, MoreHorizontal } from "react-feather";

export default function MetricTable() {
  const { applications, activeApp } = useContext(AppsContext);

  return (
    <div className="flex flex-col gap-[15px]">
      {/* Header component for the table UI */}
      <Header />
      <div className="flex flex-col gap-2">
        {/* Items components */}
        {applications?.[activeApp].groups?.map((group, i) => {
          return <Item key={i} group={group} index={i} />;
        })}
      </div>
    </div>
  );
}
function Header() {
  return (
    <div className="grid w-full grid-cols-[1.4fr,1.1fr,200px,175px,75px] gap-[10px] rounded-[12px] bg-accent px-5 py-3 text-xs uppercase text-secondary">
      <div>metric</div>
      <div>total value</div>
      <div>today</div>
      <div className="text-end">Created At</div>
    </div>
  );
}
const Item = (props: { group: Group; index: number }) => {
  const [today, setToday] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const { applications, activeApp } = useContext(AppsContext);

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

  const fetchMetricEvents = async (id: string): Promise<MetricEvent[]> => {
    const appid = applications?.[activeApp].id;

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL +
        `/events?appid=${appid}&metricid=${id}&offset=0`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) {
      try {
        const events = await res.json();
        return events;
      } catch (e) {
        console.log(e);
      }
    }

    return [];
  };

  const load = async () => {
    if (props.group.metrics.length === 0) {
      alert("no metrics found");
      return;
    }

    let tod = 0;
    if (props.group.type === GroupType.Base) {
      setTotal(props.group.metrics[0].total);
      const events = await fetchMetricEvents(props.group.metrics[0].id);
      for (let i = 0; i < events.length; i++) {
        tod += events[i].value;
      }
    } else if (props.group.type === GroupType.Dual) {
      setTotal(props.group.metrics[0].total - props.group.metrics[1].total);
      const pos = await fetchMetricEvents(props.group.metrics[0].id);
      const neg = await fetchMetricEvents(props.group.metrics[1].id);

      for (let i = 0; i < pos.length; i++) {
        tod += pos[i].value;
      }
      for (let i = 0; i < neg.length; i++) {
        tod -= neg[i].value;
      }
    }

    setToday(tod);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div
      className={`grid h-[50px] w-full select-none grid-cols-[1.4fr,1.1fr,200px,175px,75px] gap-[10px] rounded-[12px] px-5`}
    >
      <div className="flex flex-row items-center gap-[10px] text-[15px]">
        <div className="bg-accent p-2 rounded-full border border-input/50">
          <Box className="size-5 text-blue-500" />
        </div>
        {props.group.name}
      </div>
      <div className="my-auto line-clamp-1 h-fit w-full text-[15px] place-items-center items-center font-mono">
        {total === null ? "LOADING..." : total}
      </div>
      <div className="flex items-center">
        <Badge
          className={`pointer-events-none h-fit w-fit rounded-[6px] bg-zinc-500/10 font-medium text-zinc-500 shadow-none ${todayBadgeColor(
            today
          )}}`}
        >
          {todayBadgeSign(today)}
          {today === null ? "LOADING..." : today}
        </Badge>
      </div>
      <div className="flex items-center text-sm text-secondary justify-end font-light">
        {new Date(props.group.created).getFullYear()} /{" "}
        {new Date(props.group.created).getMonth()} /{" "}
        {new Date(props.group.created).getDay()}
      </div>
      <div className="h-full flex justify-end items-center w-full">
        <Button
          className="rounded-[12px] !bg-transparent"
          variant={"secondary"}
          size={"icon"}
        >
          <MoreHorizontal />
        </Button>
      </div>
    </div>
  );
};
