// External and components
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

export default function MetricDropdown(props: { children: any }) {
  return (
    <>
      {" "}
      <Dialog>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
            <DropdownMenuContent className="relative w-[150px] right-[20px] shadow-sm">
              <DialogTrigger asChild>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuSeparator />
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
              <AlertDialogAction className="border rounded-[8px] border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <EditDialogContent />
      </Dialog>
    </>
  );
}

function EditDialogContent() {
  return (
    <DialogContent className="shadow-sm rounded-sm">
      <DialogHeader>
        <DialogTitle>Edit metric</DialogTitle>
        <DialogDescription>
          You can edit your metric right here!
        </DialogDescription>
      </DialogHeader>
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-4 my-2">
          <div className="flex w-full flex-col gap-3">
            <Label>Metric name</Label>
            <Input
              placeholder="New users, Deleted projects, Suspended accounts"
              type="email"
              className="h-11 rounded-[12px]"
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <Label>Base value</Label>
            <div className="flex flex-col gap-1">
              <Input
                placeholder="Optional"
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
