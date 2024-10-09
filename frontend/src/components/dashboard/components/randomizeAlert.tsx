"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AppsContext } from "@/dashContext";
import { ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export default function RandomizeAlert(props: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { applications, activeApp, setApplications } = useContext(AppsContext);

  useEffect(() => {
    if (applications !== null) {
      if (applications[activeApp].apikey !== null) {
        setApiKey(applications[activeApp].apikey);
      }
    }
  }, [activeApp]);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      <AlertDialogContent className="border border-red-500 bg-red-500/30 backdrop-blur-3xl py-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-200">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-300">
            This action cannot be undone. This will permanently delete your
            current API KEY.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-[8px] bg-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="border rounded-[8px] border-red-500 bg-red-500 text-red-100 hover:bg-red-500/90"
            onClick={() => {
              setApiKey(null);
              fetch(process.env.NEXT_PUBLIC_API_URL + "/rand-apikey", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  appid: applications?.[activeApp].id,
                }),
                credentials: "include",
              })
                .then((res) => {
                  if (res.ok === true) {
                    return res.text();
                  } else {
                    toast.error(
                      "Failed to generate a new API KEY. Try again later."
                    );
                  }
                })
                .then((data) => {
                  if (data !== null && applications !== null) {
                    setApiKey(data as string);
                    toast.success("API key succesfully randomized");
                    setApplications(
                      applications?.map((v, i) =>
                        i === activeApp
                          ? Object.assign({}, v, {
                              apiKey: data,
                            })
                          : v
                      )
                    );
                  }
                });
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
