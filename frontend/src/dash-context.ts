import React, { createContext, Dispatch } from 'react';
import { Project, User, UserRole } from './types';

export const defaultUser: User = {
  firstname: '',
  lastname: '',
  email: '',
  id: '',
  image: '',
  plan: {
    name: '',
    requestlimit: 0,
    projectlimit: 0,
    metric_per_project_limit: 0,
    identifier: '',
    monthlyeventlimit: 0,
  },
  userrole: UserRole.Owner,
  eventcount: 0,
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
