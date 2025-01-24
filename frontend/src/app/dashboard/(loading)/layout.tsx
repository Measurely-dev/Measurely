'use client';

import { ProjectsContext, UserContext } from '@/dash-context';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { loadMetrics } from '@/utils';
import { UserRole } from '@/types';
import { Loader } from 'react-feather';

export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    projects,
    setProjects,
    setActiveProject,
    projectsLoading,
    setProjectsLoading,
    activeProject,
  } = useContext(ProjectsContext);
  const { setUser, userLoading, setUserLoading } = useContext(UserContext);
  const [activeProjectName, setActiveProjectName] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (
      projects.filter((proj) => proj.user_role === UserRole.Owner).length ===
        0 &&
      !projectsLoading
    ) {
      router.push('/dashboard/new-project');
    }

    if (userLoading) {
      fetch(process.env.NEXT_PUBLIC_API_URL + '/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            res.text().then((text) => {
              toast.error(text);
              router.push('/sign-in');
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

    if (projectsLoading) {
      fetch(process.env.NEXT_PUBLIC_API_URL + '/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
            router.push('/dashboard/new-project');
            return;
          }
          let savedActiveProject = parseInt(
            localStorage.getItem('activeProject') ?? '0',
          );
          if (savedActiveProject > json.length - 1 || savedActiveProject < 0) {
            savedActiveProject = 0;
          }
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

  useEffect(() => {
    if (
      projects === undefined ||
      !projects.length ||
      activeProject >= projects.length
    )
      return;
    setProjectsLoading(true);
    setActiveProjectName(projects[activeProject].name);
    setTimeout(() => {
      setProjectsLoading(false);
    }, 400);
    localStorage.setItem('activeProject', activeProject.toString());
  }, [activeProject]);

  return (
    <>
      {projectsLoading || userLoading ? (
        <div className='absolute left-0 top-0 flex h-[100vh] w-[100vw] select-none flex-col items-center justify-center gap-4 bg-accent'>
          <span className='sr-only'>Loader</span>
          <Loader className='size-7 animate-spin text-muted-foreground' />
          <div className='inline-flex items-center font-mono text-sm text-muted-foreground'>
            {projectsLoading && activeProjectName
              ? `Loading ${activeProjectName.charAt(0).toUpperCase() + activeProjectName.slice(1).toLowerCase()}`
              : 'Loading Measurely'}
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
