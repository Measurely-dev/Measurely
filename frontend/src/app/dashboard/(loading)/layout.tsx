'use client';

import { AppsContext, UserContext } from '@/dash-context';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoSvg from '@/components/global/logo-svg';
import { toast } from 'sonner';
import { loadMetricsGroups } from '@/utils';

export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { applications, setApplications, setActiveApp, activeApp } =
    useContext(AppsContext);
  const { user, setUser } = useContext(UserContext);

  const router = useRouter();

  useEffect(() => {
    if (applications !== null) {
      if (applications.length === 0) {
        router.push('/dashboard/new-app');
      }
    }

    if (user === null) {
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
            toast.error('User not found');
            setTimeout(() => router.push('/sign-in'), 500);
          } else {
            res.text().then((text) => {
              toast.error(text);
            });
          }
        })
        .then((json) => {
          setUser(json);
        });
    }

    if (applications === null) {
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
          if (json.length < savedActiveApp + 1) {
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
        });
    }
  }, []);

  return (
    <>
      {applications === null || user === null ? (
        <div className='absolute left-0 top-0 flex h-[100vh] w-[100vw] select-none flex-col items-center justify-center gap-8 bg-accent'>
          <div className='relative flex items-center justify-center gap-2'>
            <LogoSvg className='size-14' />
            <div className='text-xl font-semibold'>Measurely</div>
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
