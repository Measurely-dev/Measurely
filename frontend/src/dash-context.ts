import React, { createContext, Dispatch } from 'react';
import { Application, User } from './types';

export const defaultUser : User = {
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
    monthlyeventlimit : 0
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
  applications: Application[];
  setApplications: Dispatch<React.SetStateAction<Application[]>>;
  activeApp: number;
  setActiveApp: Dispatch<React.SetStateAction<number>>;
  appsLoading: boolean;
  setAppsLoading: Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => { },
  userLoading: true,
  setUserLoading: () => { },
});
export const AppsContext = createContext<AppsContextType>({
  applications: [],
  setApplications: () => { },
  activeApp: -1,
  setActiveApp: () => { },
  appsLoading: true,
  setAppsLoading: () => { },
});
