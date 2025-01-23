import React, { createContext, Dispatch } from 'react';
import { InvoiceStatus, Project, User, UserRole } from './types';

export const defaultUser: User = {
  first_name: '',
  last_name: '',
  email: '',
  id: '',
  image: '',
  user_role: UserRole.Owner,
  invoice_status: InvoiceStatus.ACTIVE,
  providers: [],
};

export interface UserContextType {
  user: User;
  setUser: Dispatch<React.SetStateAction<User>>;
  userLoading: boolean;
  setUserLoading: Dispatch<React.SetStateAction<boolean>>;
}

export interface ProjectsContextType {
  projects: Project[];
  setProjects: Dispatch<React.SetStateAction<Project[]>>;
  activeProject: number;
  setActiveProject: Dispatch<React.SetStateAction<number>>;
  projectsLoading: boolean;
  setProjectsLoading: Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  userLoading: true,
  setUserLoading: () => {},
});
export const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  setProjects: () => {},
  activeProject: -1,
  setActiveProject: () => {},
  projectsLoading: true,
  setProjectsLoading: () => {},
});
