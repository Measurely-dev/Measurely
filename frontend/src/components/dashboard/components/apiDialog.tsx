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
                <AlertDialogTitle className="text-red-200">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-red-300">
                  This action cannot be undone. This will permanently delete
                  your current API KEY.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-[14px] bg-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction className="border rounded-[14px] border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20">
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
