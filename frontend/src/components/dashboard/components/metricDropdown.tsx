"use client";
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
import { AppsContext } from "@/dashContext";
import { Group } from "@/types";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export default function MetricDropdown(props: {
  children: any;
  group: Group;
  total: number;
}) {
  const { setApplications, applications } = useContext(AppsContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog onOpenChange={(e) => setOpen(e)} open={open}>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
            <DropdownMenuContent className="relative w-[150px] right-[20px] shadow-sm">
              <DialogTrigger asChild>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </DialogTrigger>

              {props.group.type === 1 ? (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(props.group.metrics[0].id);
                      toast.success("Copied Positive Variable ID");
                    }}
                  >
                    Copy positive ID
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(props.group.metrics[1].id);
                      toast.success("Copied Negative Variable ID");
                    }}
                  >
                    Copy negative ID
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(props.group.metrics[0].id);
                      toast.success("Copied Metric ID");
                    }}
                  >
                    Copy ID
                  </DropdownMenuItem>
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
          <AlertDialogContent className="border border-destructive bg-red-500/30 backdrop-blur-3xl">
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
              <AlertDialogAction
                className="border rounded-[8px] border-red-500 bg-red-500 text-red-100 hover:bg-red-500/90"
                onClick={() => {
                  fetch(process.env.NEXT_PUBLIC_API_URL + "/group", {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      appid: props.group.appid,
                      groupid: props.group.id,
                    }),
                    credentials: "include",
                  }).then((res) => {
                    if (res.ok && applications !== null) {
                      toast.success("Metric succesfully deleted");
                      setApplications(
                        applications?.map((v, i) =>
                          v.id === props.group.appid
                            ? Object.assign({}, v, {
                                groups: v.groups?.filter(
                                  (m) => m.id !== props.group.id
                                ),
                              })
                            : v
                        )
                      );
                    } else {
                      toast.error("Failed to delete metric");
                    }
                  });
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <EditDialogContent
          group={props.group}
          total={props.total}
          setOpen={setOpen}
        />
      </Dialog>
    </>
  );
}

function EditDialogContent(props: {
  group: Group;
  total: number;
  setOpen: (value: any) => void;
}) {
  const [name, setName] = useState<string>(props.group.name);
  const [subNames, setSubNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { applications, setApplications } = useContext(AppsContext);

  function areNamesEqual(names: string[]) {
    for (let i = 0; i < names.length; i++) {
      if (names[i] !== props.group.metrics[i].name) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    setSubNames(props.group.metrics.map((m) => m.name));
  }, [props.group]);

  return (
    <DialogContent className="shadow-sm rounded-sm">
      <DialogHeader className="static">
        <DialogTitle>Edit metric</DialogTitle>
        {/* <div className="flex absolute -top-1.5 right-5 bg-input p-1 rounded-b-lg px-3 font-semibold font-mono cursor-pointer hover:text-blue-500 transition-all duration-200">
          Copy #ID
        </div> */}
      </DialogHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          let group = props.group;

          let res;

          if (name !== props.group.name) {
            res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/group", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                appid: props.group.appid,
                groupid: props.group.id,
                name: name,
              }),
              credentials: "include",
            });

            if (res.ok && applications !== null) {
              group = Object.assign({}, group, { name: name });
            }
          }

          for (let i = 0; i < subNames.length; i++) {
            if (subNames[i] !== props.group.metrics[i].name) {
              res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/metric", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  appid: props.group.appid,
                  groupid: props.group.id,
                  metricid: props.group.metrics[i].id,
                  name: subNames[i],
                }),
                credentials: "include",
              });

              if (res.ok && applications !== null) {
                group = Object.assign({}, group, {
                  metrics: group.metrics.map((metric) =>
                    metric.id === props.group.metrics[i].id
                      ? Object.assign({}, metric, {
                          name: subNames[i],
                        })
                      : metric
                  ),
                });
              }
            }
          }

          if (applications !== null) {
            setApplications(
              applications.map((v, i) =>
                v.id === props.group.appid
                  ? Object.assign({}, v, {
                      groups: v.groups?.map((g) =>
                        g.id === props.group.id
                          ? Object.assign({}, g, group)
                          : g
                      ),
                    })
                  : v
              )
            );
          }
          setLoading(false);
          props.setOpen(false);
          toast.success("Metric succesfully edited");
        }}

        className="flex flex-col gap-4"
      >
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-col gap-4">
            <div className="flex w-full flex-col gap-3">
              <Label>Metric name</Label>
              <Input
                placeholder="New users, Deleted projects, Suspended accounts"
                type="text"
                className="h-11 rounded-[12px]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {props.group.type !== 0 ? (
              <>
                <div className="flex w-full flex-col gap-3">
                  <Label>Positive name</Label>
                  <Input
                    placeholder="New users, Deleted projects, Suspended accounts"
                    type="text"
                    className="h-11 rounded-[12px]"
                    value={subNames[0]}
                    onChange={(e) =>
                      setSubNames(
                        subNames.map((v, i) => (i === 0 ? e.target.value : v))
                      )
                    }
                  />
                </div>
                <div className="flex w-full flex-col gap-3">
                  <Label>Negative name</Label>
                  <Input
                    placeholder="New users, Deleted projects, Suspended accounts"
                    type="text"
                    className="h-11 rounded-[12px]"
                    value={subNames[1]}
                    onChange={(e) =>
                      setSubNames(
                        subNames.map((v, i) => (i === 1 ? e.target.value : v))
                      )
                    }
                  />
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2 w-full">
          <DialogClose className="w-full">
            <Button
              type="button"
              variant="secondary"
              className="rounded-[12px] w-full"
              onClick={() => {
                setName(props.group.name);
                setSubNames(props.group.metrics.map((m) => m.name));
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant="default"
            className="rounded-[12px] w-full"
            loading={loading}
            disabled={
              (name === props.group.name && areNamesEqual(subNames)) || loading
            }
          >
            Update
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
