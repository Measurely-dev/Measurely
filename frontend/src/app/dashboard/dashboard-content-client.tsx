'use client';

// Import context providers and React hooks
import { defaultUser, ProjectsContext, UserContext } from '@/dash-context';
import { useState } from 'react';
import { Project, User } from '@/types';
import { ConfirmDialogProvider } from '@omit/react-confirm-dialog';

/**
 * Client-side dashboard content wrapper component that provides context for user and projects data
 * 
 * @param children - Child components to be wrapped with context providers
 * @returns Dashboard content with user and projects context
 */
export default function DashboardContentClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for managing projects data and active project selection
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<number>(0);

  // State for managing user data and loading states
  const [user, setUser] = useState<User>(defaultUser);
  const [userLoading, setUserLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  return (
    <ConfirmDialogProvider>
      {/* User context provider for user-related state management */}
      <UserContext.Provider
        value={{ user, setUser, userLoading, setUserLoading }}
      >
        {/* Projects context provider for project-related state management */}
        <ProjectsContext.Provider
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
        </ProjectsContext.Provider>
      </UserContext.Provider>
    </ConfirmDialogProvider>
  );
}
