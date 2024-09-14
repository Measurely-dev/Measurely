"use client";

import DashboardWrapper from "./wrapper";
import { AppsContext, UserContext } from "@/dashContext";
import { useEffect, useState } from "react";
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

  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      fetch(process.env.NEXT_PUBLIC_API_URL + "/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            res.text().then((text) => {
              router.push("/error?message=" + text);
            });
          } else {
            return res.json();
          }
        })
        .then((json) => {
          setUser(json);
        });
    }

    if (applications === null) {
      fetch(process.env.NEXT_PUBLIC_API_URL + "/application", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            res.text().then((text) => {
              router.push("/error?message=" + text);
            });
          } else {
            return res.json();
          }
        })
        .then((json) => {
          setApplications(json);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <AppsContext.Provider
        value={{ applications, setApplications, activeApp, setActiveApp }}
      >
        {user === null || applications === null ? (
          <>Loading</>
        ) : (
          <DashboardWrapper>{children}</DashboardWrapper>
        )}
      </AppsContext.Provider>
    </UserContext.Provider>
  );
}
