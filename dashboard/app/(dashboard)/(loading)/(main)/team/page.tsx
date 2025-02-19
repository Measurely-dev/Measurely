"use client";

// Import necessary components and utilities
import DashboardContentContainer from "@/components/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useContext, useEffect } from "react";
import { TeamTable } from "./team-table";
import TeamInvite from "./team-invite";
import { ProjectsContext } from "@/dash-context";
import { UserRole } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Main team page component
export default function TeamPage() {
  // Get project context values
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);

  // Set page metadata on component mount
  useEffect(() => {
    document.title = "Team | Measurely";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Collaborate with your team on Measurely. Manage roles, share insights, and work together to track and analyze metrics effectively.",
      );
    }
  }, []);

  // Load team members data when active project changes
  useEffect(() => {
    const loadTeam = async () => {
      if (projects[activeProject]) {
        // Only fetch if members haven't been loaded yet
        if (projects[activeProject].members === null) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/members/${projects[activeProject].id}`,
            { method: "GET", credentials: "include" },
          );

          if (response.ok) {
            const body = await response.json();
            // Update project with fetched members
            setProjects(
              projects.map((proj, i) =>
                i === activeProject
                  ? Object.assign({}, proj, { members: body })
                  : proj,
              ),
            );
          } else {
            toast.error("Failed to load the team member list");
          }
        }
      }
    };

    loadTeam();
  }, [activeProject]);

  return (
    <DashboardContentContainer className="mt-0 flex w-full pb-[15px] pt-[15px]">
      {/* Navigation breadcrumb */}
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="pointer-events-none">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Team</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Team invite component */}
      <TeamInvite
        loading={false}
        disable={projects[activeProject].user_role === UserRole.Guest}
      />

      {/* Team table or loading skeleton */}
      <div className="mt-5 h-full">
        {projects[activeProject].members === null ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <Skeleton className="h-[40px] w-full rounded-[12px]" />
              <Skeleton className="h-[40px] w-[220px] rounded-[12px]" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-[12px]" />
          </div>
        ) : (
          <TeamTable members={projects[activeProject].members} />
        )}
      </div>
    </DashboardContentContainer>
  );
}
