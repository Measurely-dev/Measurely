"use client";

// Import necessary dependencies and contexts
import { ProjectsContext, UserContext } from "@/dash-context";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loadMetrics } from "@/utils";
import { UserRole } from "@/types";
import { Loader } from "lucide-react";

// Dashboard layout component that handles project/user data loading and displays a loading state
export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get project-related state and methods from context
  const {
    projects,
    setProjects,
    setActiveProject,
    projectsLoading,
    setProjectsLoading,
    activeProject,
  } = useContext(ProjectsContext);

  // Get user-related state and methods from context
  const { setUser, userLoading, setUserLoading } = useContext(UserContext);
  const [activeProjectName, setActiveProjectName] = useState("");
  const router = useRouter();

  // Initial data loading effect
  useEffect(() => {
    // Redirect to new project page if user has no owned projects
    if (
      projects.filter((proj) => proj.user_role === UserRole.Owner).length ===
        0 &&
      !projectsLoading
    ) {
      router.push("/new-project");
    }

    // Load user data if not already loaded
    if (userLoading) {
      fetch(process.env.NEXT_PUBLIC_API_URL + "/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            res.text().then((text) => {
              toast.error(text);
              router.push("/sign-in");
            });
          }
        })
        .then((json) => {
          setUser(json);
        })
        .finally(() => {
          setUserLoading(false);
        });
    }

    // Load projects data if not already loaded
    if (projectsLoading) {
      fetch(process.env.NEXT_PUBLIC_API_URL + "/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            res.text().then((text) => {
              toast.error(text);
            });
          }
        })
        .then(async (json) => {
          if (json === undefined) return;
          if (json === null) json = [];
          if (json.length === 0) {
            router.push("/new-project");
            return;
          }

          // Get saved active project from localStorage or default to 0
          let savedActiveProject = parseInt(
            localStorage.getItem("activeProject") ?? "0",
          );
          if (savedActiveProject > json.length - 1 || savedActiveProject < 0) {
            savedActiveProject = 0;
          }

          // Load metrics only for active project
          for (let i = 0; i < json.length; i++) {
            if (
              i === savedActiveProject &&
              json.length >= savedActiveProject + 1
            ) {
              json[i].metrics = await loadMetrics(json[savedActiveProject].id);
            } else {
              json[i].metrics = null;
            }
            json[i].members = null;
            json[i].blocks = null;
          }

          setProjects(json);
          setActiveProject(savedActiveProject);
          setProjectsLoading(false);
        });
    }
  }, []);

  // Handle active project changes
  useEffect(() => {
    if (
      projects === undefined ||
      !projects.length ||
      activeProject >= projects.length
    )
      return;
    setProjectsLoading(true);
    setActiveProjectName(projects[activeProject].name);
    if (projects[activeProject].metrics === null) {
      loadMetrics(projects[activeProject].id)
        .then((data) => {
          setProjects(
            projects.map((proj, i) =>
              i === activeProject
                ? Object.assign({}, proj, {
                    metrics: data,
                  })
                : proj,
            ),
          );
        })
        .finally(() => {
          setProjectsLoading(false);
        });
    } else {
      setTimeout(() => setProjectsLoading(false), 300);
    }
    localStorage.setItem("activeProject", activeProject.toString());
  }, [activeProject]);

  // Render loading state or children components
  return (
    <>
      {projectsLoading || userLoading ? (
        <div className="absolute left-0 top-0 flex h-[100vh] w-[100vw] select-none flex-col items-center justify-center gap-4 bg-accent">
          <span className="sr-only">Loader</span>
          <Loader className="size-7 animate-spin text-muted-foreground" />
          <div className="inline-flex items-center font-mono text-sm text-muted-foreground">
            {projectsLoading && activeProjectName
              ? `Loading ${activeProjectName.charAt(0).toUpperCase() + activeProjectName.slice(1).toLowerCase()}`
              : "Loading Measurely"}
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
