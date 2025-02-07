'use client';

// Import UI components and utilities
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
import { Copy, Edit, Trash } from 'lucide-react';
import { useContext, useState } from 'react';
import { toast } from 'sonner';

// Component for displaying dropdown menu for metric actions
export default function MetricDropdown(props: {
  children: React.ReactNode;
  metric: Metric;
}) {
  const { setProjects, projects, activeProject } = useContext(ProjectsContext);
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);

  // Handle metric deletion with confirmation
  const deleteMetric = async () => {
    // Show confirmation dialog with customized styling
    const isConfirmed = await confirm({
      title: `Delete '${props.metric.name.charAt(0).toUpperCase()}${props.metric.name.slice(1).toLowerCase()}'`,
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

    // If confirmed, send delete request to API
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
          // Update projects state by removing deleted metric
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

  // Render floating panel with metric actions
  return (
    <FloatingPanelRoot onOpenChange={setOpen} open={open}>
      <FloatingPanelTrigger
        title={props.metric.name}
        className='relative'
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {props.children}
      </FloatingPanelTrigger>
      <FloatingPanelContent side='right'>
        <FloatingPanelBody className='p-1'>
          {/* Show edit button for admin/owner users */}
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
                <Edit className='size-4' />
                <span>Edit</span>
              </FloatingPanelButton>
            </DialogTrigger>
          )}

          {/* Copy metric ID button */}
          <FloatingPanelButton
            className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left transition-colors hover:bg-muted'
            onClick={(e: React.MouseEvent) => {
              navigator.clipboard.writeText(props.metric.id);
              toast.success('Successfully copied metric ID');
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <Copy className='size-4' />
            <span>Copy ID</span>
          </FloatingPanelButton>

          {/* Show delete button for admin/owner users */}
          {(projects[activeProject].user_role === UserRole.Owner ||
            projects[activeProject].user_role === UserRole.Admin) && (
            <>
              <div className='my-1 h-px bg-zinc-950/10 dark:bg-zinc-50/10' />
              <FloatingPanelButton
                className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left text-red-500 transition-colors hover:bg-red-500/20'
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  deleteMetric();
                  setOpen(false);
                }}
              >
                <Trash className='size-4' />
                <span>Delete</span>
              </FloatingPanelButton>
            </>
          )}
        </FloatingPanelBody>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}
