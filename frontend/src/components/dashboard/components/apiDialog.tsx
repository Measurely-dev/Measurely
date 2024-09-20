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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeClosedIcon } from "@radix-ui/react-icons";
import { ReactNode, useState } from "react";
import { Eye } from "react-feather";

export default function ApiDialog(props: { children: ReactNode }) {
  const [view, setView] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="shadow-sm">
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
            <Input
              id="link"
              className={`rounded-[12px] ${view ? "" : "text-secondary"}`}
              value={
                view
                  ? "AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe"
                  : "HIDDEN PRIVATE API KEY"
              }
              readOnly
            />
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
          <Button
            type="button"
            className="rounded-[16px] w-full"
            variant="default"
          >
            Randomize key
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              className="rounded-[16px] w-full"
              variant="secondary"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>{" "}
      </DialogContent>
    </Dialog>
  );
}
