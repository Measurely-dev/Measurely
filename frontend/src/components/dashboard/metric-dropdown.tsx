'use client';
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
import { useConfirm } from '@omit/react-confirm-dialog';
import { Trash } from 'lucide-react';

export default function MetricDropdown(props: {
  children: any;
  metric: Metric;
}) {
  const { setApplications, applications } = useContext(AppsContext);
  const [open, setOpen] = useState(false);
  const confirm = useConfirm();
  const DeleteMetric = async () => {
    const isConfirmed = await confirm({
      title:
        'Delete ' +
        "'" +
        props.metric.name.charAt(0).toUpperCase() +
        props.metric.name.slice(1).toLowerCase() +
        "'",
      icon: <Trash className='size-6 text-destructive' />,
      description:
        'Are you sure you want to delete this metric? You will loose all the data linked to this metric forever.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      cancelButton: {
        size: 'default',
        variant: 'outline',
        className: 'rounded-[12px]',
      },
      confirmButton: {
        className: 'bg-red-500 hover:bg-red-600 text-white rounded-[12px]',
      },
      alertDialogTitle: {
        className: 'flex items-center gap-2',
      },
      alertDialogContent: {
        className: '!rounded-[12px]',
      },
    });
    if (isConfirmed) {
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
                    metrics: v.metrics?.filter((m) => m.id !== props.metric.id),
                  })
                : v,
            ),
          );
        } else {
          toast.error('Failed to delete metric');
        }
      });
    }
  };
  return (
    <>
      <Dialog onOpenChange={(e) => setOpen(e)} open={open}>
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
                  toast.success('Succefully copied metric ID');
                }}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
            <DropdownMenuItem
              onClick={DeleteMetric}
              className='bg-red-500/0 !text-red-500 transition-all hover:!bg-red-500/20'
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <EditMetricDialogContent metric={props.metric} setOpen={setOpen} />
      </Dialog>
    </>
  );
}
