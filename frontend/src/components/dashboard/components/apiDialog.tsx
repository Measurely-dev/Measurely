"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { EyeClosedIcon } from "@radix-ui/react-icons";
import { ReactNode, useContext, useEffect, useState } from "react";
import { Eye } from "react-feather";
import { AppsContext } from "@/dashContext";
import ErrorMsg from "./error";

export default function ApiDialog(props: { children: ReactNode }) {
  const [view, setView] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");

  const { applications, activeApp, setApplications } = useContext(AppsContext);
  useEffect(() => {
    if (applications !== null) {
      if (applications[activeApp].apikey !== null) {
        setApiKey(applications[activeApp].apikey);
      }
    }
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="shadow-sm !rounded-3xl">
        <DialogHeader>
          <DialogTitle>API KEY</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to use it.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Button
              id="link"
              className={`rounded-[12px]  ${view ? "" : "text-secondary"}`}
              variant={"outline"}
              onClick={() => {
                if (apiKey !== null) {
                  navigator.clipboard.writeText(apiKey);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1000);
                }
              }}
            >
              {copied
                ? "Copied!"
                : apiKey !== null
                ? view
                  ? apiKey
                  : "Click to copy"
                : "LOADING..."}
            </Button>
          </div>
          <Button
            onClick={() => setView(!view)}
            size="sm"
            className="px-3 rounded-[12px]"
          >
            <span className="sr-only">View</span>
            {view ? (
              <EyeClosedIcon className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              className="rounded-[16px] w-full"
              variant="secondary"
            >
              Close
            </Button>
          </DialogClose>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                className="rounded-[16px] w-full"
                variant="destructiveOutline"
              >
                Randomize key
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="!rounded-3xl border border-red-500 bg-red-500/30 backdrop-blur-3xl py-8">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-200">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-red-300">
                  This action cannot be undone. This will permanently delete
                  your current API KEY.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-[14px] bg-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="border rounded-[14px] border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  onClick={() => {
                    setApiKey(null);
                    setError("");
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
                          setError(
                            "Failed to generate a new API KEY. Try again later."
                          );
                        }
                      })
                      .then((data) => {
                        if (data !== null && applications !== null) {
                          setApiKey(data as string);

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
        </DialogFooter>
        <ErrorMsg error={error} />
      </DialogContent>
    </Dialog>
  );
}
