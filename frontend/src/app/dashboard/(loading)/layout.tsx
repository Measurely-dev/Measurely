'use client';

import { AppsContext, UserContext } from '@/dash-context';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoSvg from '@/components/global/logo-svg';

export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { applications, setApplications, setActiveApp } =
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
          if (!res.ok) {
            res.text().then((text) => {
              router.push('/error?message=' + text);
            });
          } else {
            return res.json();
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
          if (!res.ok) {
            return [];
          } else {
            return res.json();
          }
        })
        .then((json) => {
          if (json === null) json = [];
          if (json.length === 0) {
            router.push('/dashboard/new-app');
            return;
          }
          for (let i = 0; i < json.length; i++) {
            json[i].groups = null;
          }
          setApplications(json);
          setActiveApp(parseInt(localStorage.getItem('activeApp') ?? '0'));
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
