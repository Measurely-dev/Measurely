'use client';

import { AppsContext, defaultUser, UserContext } from '@/dash-context';
import { useState } from 'react';
import { Application, User } from '@/types';
import { ConfirmDialogProvider } from '@omit/react-confirm-dialog';

export default function DashboardContentClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeApp, setActiveApp] = useState<number>(0);
  const [user, setUser] = useState<User>(defaultUser);
  const [userLoading, setUserLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);

  return (
    <ConfirmDialogProvider>
      <UserContext.Provider
        value={{ user, setUser, userLoading, setUserLoading }}
      >
        <AppsContext.Provider
          value={{
            applications,
            setApplications,
            activeApp,
            setActiveApp,
            appsLoading,
            setAppsLoading,
          }}
        >
          {children}
        </AppsContext.Provider>
      </UserContext.Provider>
    </ConfirmDialogProvider>
  );
}
