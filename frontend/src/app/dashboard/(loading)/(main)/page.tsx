"use client";
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
      <ProfileCard
        className="mt-5"
        email={user?.email ?? "exemple@domain.com"}
        firstName={Capitalize(user?.firstname ?? "Unknown")}
        lastName={Capitalize(user?.lastname ?? "")}
        image={user?.image ?? ""}
        profileType="Owner"
      />
      {/* Project stats */}
      <MetricStats
        className="mt-5"
        stats={[
          {
            title: "Unresolved tickets",
            description: "Across this projects",
            value: "+3",
          },
          {
            title: "Unread message",
            description: "Since your last login",
            value: "+23",
          },
          {
            title: "Invoice reccurence",
            description: "Current",
            value: "monthly",
          },
          {
            title: "Invoice payload",
            description: "this month",
            value: "-42",
          },
          {
            title: "Invoice profit",
            description: "profit this month in CAD",
            value: "$73922",
          },
        ]}
      />
    </DashboardContentContainer>
  );
}
