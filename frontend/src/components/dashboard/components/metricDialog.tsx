import { ReactNode } from "react";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy } from "react-feather";

export default function MetricDialog(props: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="shadow-none border border-accent">
        <DialogHeader>
          <DialogTitle>Create a new metric</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 my-2">
          <div className="flex w-full flex-col gap-3">
            <Label>Metric name</Label>
            <Input
              placeholder="new users, new projects, account deleted"
              type="email"
              className="h-11 rounded-[12px]"
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <Label>Base value</Label>
            <div className="flex flex-col gap-1">
              <Input
                placeholder="optional"
                type="number"
                className="h-11 rounded-[12px]"
              />
              <Label className="text-xs font-normal text-secondary leading-tight">
                Base value stands for the value of the metric before using
                measurely to measure the metric
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="default" className="rounded-[12px]">
            Create
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="rounded-[12px]"
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
