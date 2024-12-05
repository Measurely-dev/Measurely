"use client";

import { Check, ChevronsUpDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useContext, useEffect, useState } from "react";
import { Box } from "react-feather";
import { AppsContext } from "@/dashContext";
import { loadMetricsGroups } from "@/utils";
import { Group } from "@/types";

export const description = "A simple area chart";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ChartsCard() {
  const { applications, setApplications, activeApp } = useContext(AppsContext);
  const [activeGroup, setActiveGroup] = useState(0);

  useEffect(() => {
    if (applications?.[activeApp].groups === null) {
      loadMetricsGroups(applications[activeApp].id).then((json) => {
        setApplications(
          applications.map((v, i) =>
            i === activeApp ? Object.assign({}, v, { groups: json }) : v
          )
        );
      });
    }
  }, [activeApp]);

  return (
    <Card className="border-t-0 rounded-t-none border-input">
      <Header
        activeGroup={activeGroup}
        setActiveGroup={setActiveGroup}
        groups={applications?.[activeApp].groups ?? []}
      />
      <CardContent className="flex flex-row gap-5 max-md:flex-col">
        {/* Chart 1 */}
        <div className="flex flex-col gap-4 w-[100%] bg-accent p-5 rounded-xl pt-5 pb-0">
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
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
              <Bar
                dataKey="desktop"
                fill="red"
                fillOpacity={0.6}
                stroke="red"
                radius={8}
              />
            </BarChart>
          </ChartContainer>
          <CardFooter className="max-sm:hidden">
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Trending up by 5.2% this month{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  January - June 2024
                </div>
              </div>
            </div>
          </CardFooter>
        </div>
        {/* Chart 2 */}
        <div className="flex flex-col gap-4 w-[100%] bg-accent p-5 rounded-xl pt-5 pb-0">
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
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
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Area
                dataKey="desktop"
                type="linear"
                fill="blue"
                fillOpacity={0.5}
                stroke="blue"
              />
            </AreaChart>
          </ChartContainer>
          <CardFooter className="max-sm:hidden">
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Trending up by 5.2% this month{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  January - June 2024
                </div>
              </div>
            </div>
          </CardFooter>
        </div>
      </CardContent>
    </Card>
  );
}

function Header(props: {
  activeGroup: number;
  setActiveGroup: React.Dispatch<React.SetStateAction<number>>;
  groups: Group[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <CardHeader className="flex flex-row max-sm:flex-col max-sm:gap-3 justify-between">
      <div className="flex gap-1 flex-col">
        <CardTitle>0 New Users</CardTitle>
        <CardDescription>
          Metric value for the last month
        </CardDescription>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between rounded-[12px]"
          >
            {props.groups.length > 0
              ? props.groups.find((group, i) => i === props.activeGroup)?.name
              : "Select metric..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 rounded-[12px] overflow-hidden border shadow-md">
          <Command>
            <CommandInput placeholder="Search metric..." />
            <CommandList>
              <CommandEmpty>No metric found.</CommandEmpty>
              <CommandGroup>
                {props.groups.map((group, i) => (
                  <CommandItem
                    key={group.id}
                    className="rounded-[10px]"
                    onSelect={() => {
                      props.setActiveGroup(i);
                      setOpen(false);
                    }}
                  >
                    {i === props.activeGroup ? (
                      <Check className={cn("mr-2 h-4 w-4 stroke-[3px]")} />
                    ) : (
                      <Box className={cn("mr-2 h-4 w-4 text-blue-500")} />
                    )}

                    {group.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </CardHeader>
  );
}
