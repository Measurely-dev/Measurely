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
import { Check, ChevronsUpDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const multiData = [
  { month: "January", Positive: 186, Negative: 80 },
  { month: "February", Positive: 305, Negative: 200 },
  { month: "March", Positive: 237, Negative: 120 },
  { month: "April", Positive: 73, Negative: 190 },
  { month: "May", Positive: 209, Negative: 130 },
  { month: "June", Positive: 214, Negative: 140 },
];

const basicData = [
  { month: "January", total: 186 },
  { month: "February", total: 305 },
  { month: "March", total: 237 },
  { month: "April", total: 73 },
  { month: "May", total: 209 },
  { month: "June", total: 214 },
];

const chartConfig = {
  positive: {
    label: "Positive",
    color: "green",
  },
  negative: {
    label: "Negative",
    color: "red",
  },
  total: {
    label: "Total",
    color: "grey",
  },
} satisfies ChartConfig;

export default function MetricInformations(props: {
  children: ReactNode;
  metric: any;
  total: any;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="!shadow-none !rounded-[12px]">
        <DialogHeader className="static ">
          <DialogTitle className="!text-xl">{props.metric.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {props.metric.type !== 1 ? (
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

          {props.metric.type !== 1 ? (
            <></>
          ) : (
            <>
              <Label className="flex flex-col gap-2">
                Positive value total (Accounts created)
                <div className="text-green-500 font-mono text-lg">
                  -{props.total}
                </div>
              </Label>
              <Label className="flex flex-col gap-2">
                Negative value total (Accounts deleted)
                <div className="text-red-500 font-mono text-lg">
                  +{props.total}
                </div>
              </Label>
            </>
          )}
        </div>
        {props.metric.type !== 1 ? (
          <>
            <ChartContainer config={chartConfig}>
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
                  type='natural'
                  fill="grey"
                  fillOpacity={0.6}
                  stroke="grey"
                  radius={8}
                />
              </AreaChart>
            </ChartContainer>
          </>
        ) : (
          <>
            <ChartContainer config={chartConfig}>
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
                  dataKey="Positive"
                  type="natural"
                  fill="lime"
                  fillOpacity={0.4}
                  stroke="lime"
                  stackId="a"
                />
                <Area
                  dataKey="Negative"
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

        <div className="flex flex-row gap-2 w-full">
          <DialogClose className="w-full">
            <Button
              type="button"
              variant="secondary"
              className="rounded-[12px] w-full"
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
