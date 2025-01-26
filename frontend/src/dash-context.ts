import React, { createContext, Dispatch } from 'react';
import { InvoiceStatus, Project, User, UserRole } from './types';

// Default user object with empty values used for initialization
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

// Type definition for the User context containing current user state and loading status
export interface UserContextType {
  user: User;                                              // Current user object
  setUser: Dispatch<React.SetStateAction<User>>;          // Function to update user
  userLoading: boolean;                                   // Loading state flag
  setUserLoading: Dispatch<React.SetStateAction<boolean>>; // Function to update loading state
}

// Type definition for the Projects context containing projects list and active project
export interface ProjectsContextType {
  projects: Project[];                                     // Array of all projects
  setProjects: Dispatch<React.SetStateAction<Project[]>>; // Function to update projects list
  activeProject: number;                                  // ID of currently selected project
  setActiveProject: Dispatch<React.SetStateAction<number>>; // Function to update active project
  projectsLoading: boolean;                               // Projects loading state flag
  setProjectsLoading: Dispatch<React.SetStateAction<boolean>>; // Function to update projects loading state
}

// Create User context with default values
export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  userLoading: true,
  setUserLoading: () => {},
});

// Create Projects context with default values
export const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  setProjects: () => {},
  activeProject: -1,
  setActiveProject: () => {},
  projectsLoading: true,
  setProjectsLoading: () => {},
});
