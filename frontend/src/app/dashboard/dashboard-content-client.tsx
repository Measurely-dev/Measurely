'use client';

import { AppsContext, defaultUser, UserContext } from '@/dash-context';
import { useState } from 'react';
import { Project, User } from '@/types';
import { ConfirmDialogProvider } from '@omit/react-confirm-dialog';

export default function DashboardContentClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<number>(0);
  const [user, setUser] = useState<User>(defaultUser);
  const [userLoading, setUserLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  return (
    <ConfirmDialogProvider>
      <UserContext.Provider
        value={{ user, setUser, userLoading, setUserLoading }}
      >
        <AppsContext.Provider
          value={{
            projects,
            setProjects,
            activeProject,
            setActiveProject,
            projectsLoading,
            setProjectsLoading,
          }}
        >
          {children}
        </AppsContext.Provider>
      </UserContext.Provider>
    </ConfirmDialogProvider>
  );
}
