'use client';

import { ProjectsContext, UserContext } from '@/dash-context';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoSvg from '@/components/global/logo-svg';
import { toast } from 'sonner';
import { loadMetrics } from '@/utils';
import { LoaderIcon } from 'lucide-react';
import { UserRole } from '@/types';

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
  } = useContext(ProjectsContext);
  const { setUser, userLoading, setUserLoading } = useContext(UserContext);

  const router = useRouter();

  useEffect(() => {
    if (
      projects.filter((proj) => proj.userrole === UserRole.Owner).length ===
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
            localStorage.setItem(
              'activeProject',
              savedActiveProject.toString(),
            );
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
          }

          setProjects(json);
          setActiveProject(savedActiveProject);
          setProjectsLoading(false);
        });
    }
  }, []);

  return (
    <>
      {projectsLoading || userLoading ? (
        <div className='absolute left-0 top-0 flex h-[100vh] w-[100vw] select-none flex-col items-center justify-center gap-8 bg-accent'>
          <div className='relative flex flex-col items-center justify-center gap-2'>
            <LogoSvg className='size-20' />
          </div>
          <LoaderIcon className='size-5 animate-spin' />
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
