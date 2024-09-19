import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppsContext } from "@/dashContext";
import { useContext } from "react";
import { Box, MoreHorizontal } from "react-feather";

export default function MetricTable () {
  const {applications, activeApp} = useContext(AppsContext);

  return (
    <div className="flex flex-col gap-[15px]">
      {/* Header component for the table UI */}
      <Header />
      <div className="flex flex-col gap-2">
        {/* Items components */}
        {applications?.[activeApp].groups?.map((group, i) => {
          return (
            <Item
              key={i}
              today={Date()}
              name={group.name}
              value={group.value}
              created={group.created}
            />
          );
        })}
      </div>
    </div>
  );
}
function Header() {
  return (
    <div className="grid w-full grid-cols-[1.4fr,1.1fr,200px,175px,75px] gap-[10px] rounded-[12px] bg-accent px-5 py-3 text-xs uppercase text-secondary">
      <div>metric</div>
      <div>value</div>
      <div>today</div>
      <div className="text-end">Created At</div>
    </div>
  );
}
const Item: any = (props: any) => {
  return (
    <div
      onClick={props.setSelectedProject}
      className={`grid h-[50px] w-full select-none grid-cols-[1.4fr,1.1fr,200px,175px,75px] gap-[10px] rounded-[12px] px-5`}
    >
      <div className="flex flex-row items-center gap-[10px] text-[15px]">
        <div className="bg-accent p-2 rounded-full border border-input/50">
          <Box className="size-5 text-blue-500" />
        </div>
        {props.name}
      </div>
      <div className="my-auto line-clamp-1 h-fit w-full text-[15px] place-items-center items-center font-mono">
        {props.value}
      </div>
      <div className="flex items-center">
        <Badge className={`pointer-events-none h-fit w-fit rounded-[6px] bg-zinc-500/10 font-medium text-zinc-500 shadow-none ${props.today > 0 ? "before:content-['+'] bg-green-100 text-green-600" : 'bg-red-100 text-red-600'}`}>
          {props.today}
        </Badge>
      </div>
      <div className="flex items-center text-sm text-secondary justify-end font-light">
        {props.created}
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
