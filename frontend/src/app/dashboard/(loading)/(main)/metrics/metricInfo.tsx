import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";
import { Check, ChevronsUpDown, TrendingUp, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Group } from "@/types";

const multiData = [
  { month: "January", positive: 186, negative: 80 },
  { month: "February", positive: 305, negative: 200 },
  { month: "March", positive: 237, negative: 120 },
  { month: "April", positive: 73, negative: 190 },
  { month: "May", positive: 209, negative: 130 },
  { month: "June", positive: 214, negative: 140 },
];

const basicData = [
  { month: "January", total: 186 },
  { month: "February", total: 305 },
  { month: "March", total: 237 },
  { month: "April", total: 73 },
  { month: "May", total: 209 },
  { month: "June", total: 214 },
];

export default function MetricInformations(props: {
  children: ReactNode;
  group: Group;
  total: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="!shadow-none !ring ring-input !rounded-[16px] !min-w-[60%] max-h-[95%]">
        <DialogHeader className="static ">
          <DialogTitle className="!text-xl">{props.group.name}</DialogTitle>
          <DialogClose className="absolute right-5 top-3">
            <Button
              type="button"
              size={"icon"}
              variant="secondary"
              className="rounded-[12px]"
            >
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {props.group.type !== 1 ? (
            <Label className="flex flex-col gap-2">
              Total
              <div className="font-mono text-lg bg-accent flex rounded-[12px] justify-center px-4 items-center p-2">
                {props.total}
              </div>
            </Label>
          ) : (
            <Label className="flex flex-col gap-2">
              Total
              <div className="font-mono text-lg bg-green-500/20 text-green-500 flex rounded-[12px] justify-center px-4 items-center p-2">
                {props.total}
              </div>
            </Label>
          )}

          {props.group.type !== 1 ? (
            <></>
          ) : (
            <div className="flex flex-col gap-2 xl:flex-row xl:justify-between">
              <Label className="flex flex-col gap-2">
                {props.group.metrics[0].name}
                <div className="text-green-500 font-mono text-lg">
                  -{props.total}
                </div>
              </Label>
              <Label className="flex flex-col gap-2 xl:text-end">
                {props.group.metrics[0].name}
                <div className="text-red-500 font-mono text-lg">
                  +{props.total}
                </div>
              </Label>
            </div>
          )}
        </div>
        {props.group.type === 0 ? (
          <>
            <ChartContainer
              config={{
                total: {
                  label: props.group.name,
                  color: "skyblue",
                },
              }}
            >
              <AreaChart
                accessibilityLayer
                data={basicData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Area
                  dataKey="total"
                  type="natural"
                  fill="skyblue"
                  fillOpacity={0.5}
                  stroke="skyblue"
                  radius={8}
                />
              </AreaChart>
            </ChartContainer>
          </>
        ) : (
          <>
            <ChartContainer
              config={{
                positive: {
                  label: props.group.metrics[0].name,
                  color: "green",
                },
                negative : {
                  label: props.group.metrics[1].name,
                  color: "red",
                }
              }}
            >
              <AreaChart
                accessibilityLayer
                data={multiData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="positive"
                  type="natural"
                  fill="lime"
                  fillOpacity={0.4}
                  stroke="lime"
                  stackId="a"
                />
                <Area
                  dataKey="negative"
                  type="natural"
                  fill="red"
                  fillOpacity={0.4}
                  stroke="red"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
