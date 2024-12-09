'use client';
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
} from '@/components/ui/alert-dialog';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppsContext } from '@/dashContext';
import { Group } from '@/types';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import EditMetricDialogContent from './editMetricDialogContent';

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
            <DropdownMenuContent className='relative right-[20px] w-[150px] shadow-sm'>
              <DialogTrigger asChild>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </DialogTrigger>

              {props.group.type === 1 ? (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(props.group.metrics[0].id);
                      toast.success('Copied Positive Variable ID');
                    }}
                  >
                    Copy positive ID
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(props.group.metrics[1].id);
                      toast.success('Copied Negative Variable ID');
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
                      toast.success('Copied Metric ID');
                    }}
                  >
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className='bg-red-500/0 !text-red-500 transition-all hover:!bg-red-500/20'>
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent className='border border-destructive bg-red-500/30 backdrop-blur-3xl'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-red-200'>
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-red-300'>
                This action cannot be undone. This will permanently delete this
                metric.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='rounded-[8px] bg-white'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className='rounded-[8px] border border-red-500 bg-red-500 text-red-100 hover:bg-red-500/90'
                onClick={() => {
                  fetch(process.env.NEXT_PUBLIC_API_URL + '/group', {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      appid: props.group.appid,
                      groupid: props.group.id,
                    }),
                    credentials: 'include',
                  }).then((res) => {
                    if (res.ok && applications !== null) {
                      toast.success('Metric succesfully deleted');
                      setApplications(
                        applications?.map((v, i) =>
                          v.id === props.group.appid
                            ? Object.assign({}, v, {
                                groups: v.groups?.filter(
                                  (m) => m.id !== props.group.id,
                                ),
                              })
                            : v,
                        ),
                      );
                    } else {
                      toast.error('Failed to delete metric');
                    }
                  });
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <EditMetricDialogContent
          group={props.group}
          total={props.total}
          setOpen={setOpen}
        />
      </Dialog>
    </>
  );
}
