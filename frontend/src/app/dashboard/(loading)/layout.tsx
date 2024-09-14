"use client";

import { AppsContext, UserContext } from "@/dashContext";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { applications, setApplications } = useContext(AppsContext);
  const { user, setUser } = useContext(UserContext);

  const router = useRouter();

  useEffect(() => {
    if (applications !== null) {
      if (applications.length === 0) {
        router.push("/dashboard/new-app");
      }
    }

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
          if (json === null || json.length === 0) {
            router.push("/dashboard/new-app");
          }
          setApplications(json);
        });
    }
  }, []);

  return (
    <>{applications === null || user === null ? <>LOADING</> : <>{ children }</>}</>
  );
}
