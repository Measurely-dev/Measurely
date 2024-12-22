'use client';

import { AppsContext, UserContext } from '@/dash-context';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoSvg from '@/components/global/logo-svg';
import { toast } from 'sonner';
import { loadMetricsGroups } from '@/utils';
import { LoaderIcon } from 'lucide-react';

export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    applications,
    setApplications,
    setActiveApp,
    appsLoading,
    setAppsLoading,
  } = useContext(AppsContext);
  const { setUser, userLoading, setUserLoading } = useContext(UserContext);

  const router = useRouter();

  useEffect(() => {
    if (applications.length === 0 && !appsLoading) {
      router.push('/dashboard/new-app');
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
          } else if (res.status === 404) {
            res.text().then((text) => {
              toast.error(text);
              window.location.replace("/sign-in")
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

    if (appsLoading) {
      fetch(process.env.NEXT_PUBLIC_API_URL + '/application', {
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
            router.push('/dashboard/new-app');
            return;
          }
          let savedActiveApp = parseInt(
            localStorage.getItem('activeApp') ?? '0',
          );
          if (savedActiveApp > json.length - 1 || savedActiveApp < 0) {
            savedActiveApp = 0;
            localStorage.setItem('activeApp', savedActiveApp.toString());
          }
          for (let i = 0; i < json.length; i++) {
            if (i === savedActiveApp && json.length >= savedActiveApp + 1) {
              json[i].groups = await loadMetricsGroups(json[savedActiveApp].id);
            } else {
              json[i].groups = null;
            }
          }

          setApplications(json);
          setActiveApp(savedActiveApp);
          setAppsLoading(false);
        });
    }
  }, []);

  return (
    <>
      {appsLoading || userLoading ? (
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
