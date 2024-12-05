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
import { Label } from "@/components/ui/label";
import { EyeClosedIcon } from "@radix-ui/react-icons";
import { ReactNode, useContext, useEffect, useState } from "react";
import { Eye } from "react-feather";
import { AppsContext } from "@/dashContext";
import { X } from "lucide-react";
import RandomizeAlert from "./randomizeAlert";

export default function ApiDialog(props: {
  children: ReactNode;
  randomize?: boolean | false;
  app?: string;
}) {
  const [view, setView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { applications, activeApp, setApplications } = useContext(AppsContext);

  useEffect(() => {
    if (applications !== null) {
      if (applications[activeApp].apikey !== null) {
        setApiKey(applications[activeApp].apikey);
      }
    }
    if (props.app !== null && applications !== null) {
      const appIndex = applications.findIndex((app) => app.name === props.app);
      if (appIndex !== -1 && applications[appIndex].apikey !== null) {
        setApiKey(applications[appIndex].apikey);
      }
    }
  }, [activeApp, applications]);

  return (
    <Dialog onOpenChange={() => setView(false)}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="shadow-none border max-md:max-w-[95%] border-input !rounded-xl">
        <DialogHeader className="max-md:text-start">
          <DialogTitle>API KEY</DialogTitle>
          <DialogDescription>
            Anyone who has this key will be able to use it.
          </DialogDescription>
          <DialogClose className="absolute right-5 top-3">
            <Button
              type="button"
              size={"icon"}
              variant="secondary"
              className="rounded-[12px]"
            >
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex items-center">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Button
              id="link"
              className={`rounded-[8px] rounded-r-none border-r-0  ${view ? "" : "text-secondary"
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
        {props.randomize ? (
          <RandomizeAlert app={props?.app}>
            <Button
              className="rounded-[12px]"
              variant={"destructiveOutline"}
            >
              Randomize key
            </Button>
          </RandomizeAlert>
        ) : undefined}
      </DialogContent>
    </Dialog>
  );
}
