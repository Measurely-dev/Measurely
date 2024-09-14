import { createContext, Dispatch } from "react";
import { Application, User } from "./types";

export interface UserContextType {
  user: User | null;
  setUser: Dispatch<React.SetStateAction<User | null>>;
}

export interface AppsContextType {
  applications: Application[] | null;
  setApplications: Dispatch<React.SetStateAction<Application[] | null>>; 
  activeApp: number;
  setActiveApp: Dispatch<React.SetStateAction<number>>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});
export const AppsContext = createContext<AppsContextType>({
  applications: null,
  setApplications: () => {},
  activeApp: 0,
  setActiveApp: () => {},
});
