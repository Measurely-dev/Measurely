'use client';
import { DialogTrigger } from '@/components/ui/dialog';
import {
  FloatingPanelBody,
  FloatingPanelButton,
  FloatingPanelContent,
  FloatingPanelRoot,
  FloatingPanelTrigger,
} from '@/components/ui/floating-panel';
import { ProjectsContext } from '@/dash-context';
import { Metric, Project, UserRole } from '@/types';
import { useConfirm } from '@omit/react-confirm-dialog';
import { Copy, Edit, Trash } from 'lucide-react'; // Import icons
import { useContext, useState } from 'react';
import { toast } from 'sonner';

export default function MetricDropdown(props: {
  children: React.ReactNode;
  metric: Metric;
}) {
  const { setProjects, projects, activeProject } = useContext(ProjectsContext);
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);

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
        'Are you sure you want to delete this metric? You will lose all the data linked to this metric forever.',
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
          project_id: props.metric.project_id,
          metric_id: props.metric.id,
        }),
        credentials: 'include',
      }).then((res) => {
        if (res.ok && projects !== null) {
          toast.success('Metric successfully deleted');
          setProjects(
            projects.map((v: Project) =>
              v.id === props.metric.project_id
                ? {
                    ...v,
                    metrics:
                      v.metrics?.filter((m) => m.id !== props.metric.id) ??
                      null,
                  }
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
    <FloatingPanelRoot onOpenChange={setOpen} open={open}>
      <FloatingPanelTrigger
        title={props.metric.name} // Use metric name as the title
        className='relative'
        onClick={(e) => {
          e.stopPropagation(); // Stop event propagation
        }}
      >
        {props.children}
      </FloatingPanelTrigger>
      <FloatingPanelContent
        className='w-[200px] rounded-lg border border-zinc-950/10 bg-white shadow-sm dark:border-zinc-50/10 dark:bg-zinc-800'
        side='right'
      >
        <FloatingPanelBody className='p-1'>
          {(projects[activeProject].user_role === UserRole.Owner ||
            projects[activeProject].user_role === UserRole.Admin) && (
            <DialogTrigger asChild>
              <FloatingPanelButton
                className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left transition-colors hover:bg-muted'
                onClick={(e: React.MouseEvent) => {
                  setOpen(false);
                  e.stopPropagation();
                }}
              >
                <Edit className='size-4' /> {/* Edit icon */}
                <span>Edit</span>
              </FloatingPanelButton>
            </DialogTrigger>
          )}
          <FloatingPanelButton
            className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left transition-colors hover:bg-muted'
            onClick={(e: React.MouseEvent) => {
              navigator.clipboard.writeText(props.metric.id);
              toast.success('Successfully copied metric ID');
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <Copy className='size-4' /> {/* Copy icon */}
            <span>Copy ID</span>
          </FloatingPanelButton>
          {(projects[activeProject].user_role === UserRole.Owner ||
            projects[activeProject].user_role === UserRole.Admin) && (
            <>
              <div className='my-1 h-px bg-zinc-950/10 dark:bg-zinc-50/10' />
              <FloatingPanelButton
                className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left text-red-500 transition-colors hover:bg-red-500/20'
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  DeleteMetric();
                  setOpen(false);
                }}
              >
                <Trash className='size-4' /> {/* Delete icon */}
                <span>Delete</span>
              </FloatingPanelButton>
            </>
          )}
        </FloatingPanelBody>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}
