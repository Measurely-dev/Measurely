import React, { createContext, Dispatch } from 'react';
import { Project, User } from './types';

export const defaultUser: User = {
  firstname: '',
  lastname: '',
  email: '',
  id: '',
  image: '',
  plan: {
    name: '',
    requestlimit: 0,
    applimit: 0,
    metric_per_app_limit: 0,
    identifier: '',
    monthlyeventlimit: 0,
  },
  eventcount: 0,
  providers: [],
};

export interface UserContextType {
  user: User;
  setUser: Dispatch<React.SetStateAction<User>>;
  userLoading: boolean;
  setUserLoading: Dispatch<React.SetStateAction<boolean>>;
}

export interface AppsContextType {
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
export const AppsContext = createContext<AppsContextType>({
  projects: [],
  setProjects: () => {},
  activeProject: -1,
  setActiveProject: () => {},
  projectsLoading: true,
  setProjectsLoading: () => {},
});
