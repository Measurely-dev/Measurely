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
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { AppsContext } from "@/dashContext";

export default function DashboardMetrics() {
  const { applications,setApplications, activeApp } = useContext(AppsContext);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("new")

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
        console.log(json)
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
              <SearchComponent search={search} setSearch={setSearch}/>
              <FiltersComponent filter={filter} setFilter={setFilter}/>
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
                </div>
              </Empty>
            ) : (
              <MetricTable search={search} filter={filter}/>
            )}
          </div>
        )}
      </div>
    </DashboardContentContainer>
  );
}

function FiltersComponent(props : {filter : string, setFilter : Dispatch<SetStateAction<string>>}) {
  return (
    <Select value={props.filter} onValueChange={props.setFilter}>
      <SelectTrigger className="w-[220px] min-w-[220px] bg-accent">
        <SelectValue placeholder="Select filter" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="new">Newest to oldest</SelectItem>
          <SelectItem value="old">Oldest to newest</SelectItem>
          <SelectItem value="total">Total value</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SearchComponent(props : {
  search : string,
  setSearch : Dispatch<SetStateAction<string>>
}) {
  return (
    <div className="flex w-full flex-row items-center gap-[0px] rounded-[12px] bg-accent pl-[12px]">
      <Search className="size-[18px] text-secondary" />
      <Input
        className="px-0!ring-0 h-[40px] w-full rounded-none border-none bg-transparent"
        placeholder="Search metric..."
        value={props.search}
        onChange={(e) => props.setSearch(e.target.value)}
      />
    </div>
  );
}
