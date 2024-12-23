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
import { AppsContext } from '@/dash-context';
import { Metric } from '@/types';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import EditMetricDialogContent from './edit-metric-dialog-content';

export default function MetricDropdown(props: {
  children: any;
  metric: Metric;
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
              <>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(props.metric.id);
                    toast.success('Copied Metric ID');
                  }}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
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
                  fetch(process.env.NEXT_PUBLIC_API_URL + '/metric', {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      appid: props.metric.appid,
                      metricid: props.metric.id,
                    }),
                    credentials: 'include',
                  }).then((res) => {
                    if (res.ok && applications !== null) {
                      toast.success('Metric succesfully deleted');
                      setApplications(
                        applications?.map((v) =>
                          v.id === props.metric.appid
                            ? Object.assign({}, v, {
                                metrics: v.metrics?.filter(
                                  (m) => m.id !== props.metric.id,
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
        <EditMetricDialogContent metric={props.metric} setOpen={setOpen} />
      </Dialog>
    </>
  );
}
