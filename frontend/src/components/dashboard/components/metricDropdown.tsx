// External and components
import MetricInformations from "@/app/dashboard/(loading)/(main)/metrics/metricInfo";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MetricDropdown(props: {
  children: any;
  metric: any;
  total: any;
}) {
  return (
    <>
      <Dialog>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
            <DropdownMenuContent className="relative w-[150px] right-[20px] shadow-sm">
              <DialogTrigger asChild>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </DialogTrigger>

              {props.metric.type === 1 ? (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem>Copy positive ID</DropdownMenuItem>
                  <DropdownMenuItem>Copy negative ID</DropdownMenuItem>

                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  <DropdownMenuItem>Copy ID</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="bg-red-500/0 hover:!bg-red-500/20 transition-all !text-red-500">
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent className="border border-red-500 bg-red-500/30 backdrop-blur-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-200">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-red-300">
                This action cannot be undone. This will permanently delete this
                metric.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-[8px] bg-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction className="border rounded-[8px] border-red-500 bg-red-500 text-red-100 hover:bg-red-500/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <EditDialogContent metric={props.metric} total={props.total} />
      </Dialog>
    </>
  );
}

function EditDialogContent(props: { metric: any; total: any }) {
  return (
    <DialogContent className="shadow-sm rounded-sm">
      <DialogHeader className="static">
        <DialogTitle>Edit metric</DialogTitle>
        {/* <div className="flex absolute -top-1.5 right-5 bg-input p-1 rounded-b-lg px-3 font-semibold font-mono cursor-pointer hover:text-blue-500 transition-all duration-200">
          Copy #ID
        </div> */}
      </DialogHeader>
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-3">
            <Label>Metric name</Label>
            <Input
              placeholder="New users, Deleted projects, Suspended accounts"
              type="email"
              className="h-11 rounded-[12px]"
              value={props.metric.name}
            />
          </div>
          {props.metric.type !== 0 ? (
            <>
              <div className="flex w-full flex-col gap-3">
                <Label>Positive value name</Label>
                <Input
                  placeholder="New users, Deleted projects, Suspended accounts"
                  type="email"
                  className="h-11 rounded-[12px]"
                  value="Account created"
                />
              </div>
              <div className="flex w-full flex-col gap-3">
                <Label>Negative value name</Label>
                <Input
                  placeholder="New users, Deleted projects, Suspended accounts"
                  type="email"
                  className="h-11 rounded-[12px]"
                  value="Users deleted"
                />
              </div>
            </>
          ) : (
            <div className="flex w-full flex-col gap-3">
              <Label>Base value</Label>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Optional"
                  type="number"
                  className="h-11 rounded-[12px]"
                  value={props.total}
                />
                <Label className="text-xs font-normal text-secondary leading-tight">
                  Base value stands for the value of the metric before using
                  measurely to measure the metric
                </Label>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row gap-2 w-full">
        <DialogClose className="w-full">
          <Button
            type="button"
            variant="secondary"
            className="rounded-[12px] w-full"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          variant="default"
          className="rounded-[12px] w-full"
        >
          Update
        </Button>
      </div>
    </DialogContent>
  );
}
