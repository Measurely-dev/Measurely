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
import { useState } from "react";
import { Plus, Search } from "react-feather";
import ProjectTable from "./metricTable";
import Link from "next/link";

const metrics: any = [
  {
    name: "Accounts",
    value: "1239223",
    today: -234,
    created: 'June 2, 2024'
  },
  {
    name: "Metrics",
    value: "3432948798432",
    today: +384382,
    created: 'December 8, 2023'
  },
];

export default function DashboardMetrics() {
  const [selectedProject, setSelectedProject] = useState<number>(0);
  return (
    <DashboardContentContainer className="w-full flex pb-[15px] mt-0 pt-[15px]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={'/'}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Metrics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* /Breadcrumb */}
      <div className="mt-5 flex h-full flex-row gap-5">
        <div className="flex w-full flex-col gap-[10px]">
          <div className="flex w-full flex-row gap-[10px]">
            <SearchComponent />
            <FiltersComponent />
            <Link href={'/new'}>
              <Button className="h-full gap-[8px] rounded-[12px]">
                <Plus className="size-[16px]" />
                Add metric
              </Button>
            </Link>
          </div>

          {metrics.length === 0 ? (
            <Empty>
              <ArchiveIcon className="h-17 w-16" />
              <div className="flex flex-col items-center gap-3 text-center">
                No project created yet
                <div className="w-[349px] text-sm">
                  Create a project that you can connect to your client&apos;s
                  later
                </div>
              </div>
            </Empty>
          ) : (
            <ProjectTable
              metrics={metrics}
              setSelectedProject={setSelectedProject}
              selectedProject={selectedProject}
            />
          )}
        </div>
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
