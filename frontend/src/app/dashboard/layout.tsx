"use client";

import { AppsContext, UserContext } from "@/dashContext";
import { useState } from "react";
import { Application, User } from "@/types";
import { useRouter } from "next/navigation";

export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [activeApp, setActiveApp] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <AppsContext.Provider
        value={{ applications, setApplications, activeApp, setActiveApp }}
      >
        {children}
      </AppsContext.Provider>
    </UserContext.Provider>
  );
}
