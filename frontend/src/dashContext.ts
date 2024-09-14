import { createContext } from "react";
import { Application, User } from "./types";

export interface UserContextType {
  user: User | null;
  setUser: (new_user: User) => void;
}

export interface AppsContextType {
  applications: Application[] | null;
  setApplications: (new_applications: Application[]) => void;
  activeApp: number;
  setActiveApp: (new_applications: number) => void;
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
