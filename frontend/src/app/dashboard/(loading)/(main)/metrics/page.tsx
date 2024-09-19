"use client";
import DashboardContentContainer from "@/components/dashboard/container/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Empty from "@/components/dashboard/components/empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArchiveIcon } from "@radix-ui/react-icons";
import { Plus, Search } from "react-feather";
import MetricTable from "./metricTable";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { AppsContext } from "@/dashContext";

export default function DashboardMetrics() {
  const { applications,setApplications, activeApp } = useContext(AppsContext);


  useEffect(() => {
    if (applications?.[activeApp].groups === null) {
      fetch(process.env.NEXT_PUBLIC_API_URL + "/metric-groups?appid=" + applications?.[activeApp].id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }).then(res => {
        if (res.ok)
        {
          return res.json();
        } else {
          return [];
        }
      }).then(json => {
        if (json === null)
        {
          json = []
        }
        setApplications(applications.map((v, i) => (i === activeApp ? Object.assign({}, v, { groups: json }): v)));
      })
    }
  }, [activeApp])

  return (
    <DashboardContentContainer className="w-full flex pb-[15px] mt-0 pt-[15px]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="pointer-events-none">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Metrics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* /Breadcrumb */}
      <div className="mt-5 flex h-full flex-row gap-5">
        {applications?.[activeApp].groups === null ? (
          <div>LOADING...</div>
        ) : (
          <div className="flex w-full flex-col gap-[10px]">
            <div className="flex w-full flex-row gap-[10px]">
              <SearchComponent />
              <FiltersComponent />
              <Link href={"/dashboard/new-metric"}>
                <Button className="h-full gap-[8px] rounded-[12px]">
                  <Plus className="size-[16px]" />
                  Add metric
                </Button>
              </Link>
            </div>

            {applications?.[activeApp].groups?.length === 0 ? (
              <Empty>
                <ArchiveIcon className="size-10" />
                <div className="flex flex-col items-center gap-3 text-center">
                  No metric created yet
                  <div className="w-[349px] text-sm">Create a metric</div>
                </div>
              </Empty>
            ) : (
              <MetricTable />
            )}
          </div>
        )}
      </div>
    </DashboardContentContainer>
  );
}

function FiltersComponent() {
  return (
    <Select>
      <SelectTrigger className="w-[220px] min-w-[220px] bg-accent">
        <SelectValue placeholder="Select filter(s)" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">All filters</SelectItem>
          <SelectItem value="high">Date created</SelectItem>
          <SelectItem value="medium">Type</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SearchComponent() {
  return (
    <div className="flex w-full flex-row items-center gap-[0px] rounded-[12px] bg-accent pl-[12px]">
      <Search className="size-[18px] text-secondary" />
      <Input
        className="px-0!ring-0 h-[40px] w-full rounded-none border-none bg-transparent"
        placeholder="Search metric..."
      />
    </div>
  );
}
