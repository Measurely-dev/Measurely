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
import { toast } from "sonner";

export default function ApiDialog(props: { children: ReactNode }) {
  const [view, setView] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { applications, activeApp, setApplications } = useContext(AppsContext);
  useEffect(() => {
    if (applications !== null) {
      if (applications[activeApp].apikey !== null) {
        setApiKey(applications[activeApp].apikey);
      }
    }
  }, [activeApp]);

  return (
    <Dialog onOpenChange={() => setView(false)}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="shadow-none border border-input !rounded-lg">
        <DialogHeader>
          <DialogTitle>API KEY</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to use it.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Button
              id="link"
              className={`rounded-[8px] rounded-r-none border-r-0  ${
                view ? "" : "text-secondary"
              }`}
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
            variant={"secondary"}
            className="px-3 rounded-[8px] border-l-0 rounded-l-none h-full border"
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
              className="rounded-[12px] w-full"
              variant="secondary"
            >
              Close
            </Button>
          </DialogClose>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                className="rounded-[12px] w-full"
                variant="destructiveOutline"
              >
                Randomize key
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border border-red-500 bg-red-500/30 backdrop-blur-3xl py-8">
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
                          toast.success('API key succesfully randomized')
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
      </DialogContent>
    </Dialog>
  );
}
