"use client";
import { ChartsCard } from "@/components/dashboard/components/chartsCard";
import MetricStats from "@/components/dashboard/components/metricStats";
import ProfileCard from "@/components/dashboard/components/profileCard";
import DashboardContentContainer from "@/components/dashboard/container/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UserContext } from "@/dashContext";
import { useContext } from "react";

export default function DashboardHomePage() {
  const { user } = useContext(UserContext);

  function Capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <DashboardContentContainer className="w-full flex pb-[15px] mt-0 pt-[15px]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="pointer-events-none">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* <ProfileCard
        className="mt-5"
        email={user?.email ?? "exemple@domain.com"}
        firstName={Capitalize(user?.firstname ?? "Unknown")}
        lastName={Capitalize(user?.lastname ?? "")}
        image={user?.image ?? ""}
        profileType="Owner"
      /> */}
      {/* Project stats */}
      <MetricStats
        className="mt-5"
        stats={[
          {
            title: "Number of metric",
            description: "Across this application",
            value: "+25",
          },
          {
            title: "Number of dual metric",
            description: "Across this application",
            value: "+13",
          },
          {
            title: "Number of basic metric",
            description: "Across this application",
            value: "+12",
          },
          {
            title: "Metric payload",
            description: "this month",
            value: "-42",
          }
        ]}
      />
      {/* Charts card (2 charts) */}
      <ChartsCard />
    </DashboardContentContainer>
  );
}
