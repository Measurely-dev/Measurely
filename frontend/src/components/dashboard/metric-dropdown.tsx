'use client';
import { DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Metric, Project, UserRole } from '@/types';
import { useContext } from 'react';
import { toast } from 'sonner';
import { useConfirm } from '@omit/react-confirm-dialog';
import { Trash } from 'lucide-react';
import { ProjectsContext } from '@/dash-context';

export default function MetricDropdown(props: {
  children: any;
  metric: Metric;
  isOpen: boolean | false;
  setIsOpen: (state: any) => void;
}) {
  const { setProjects, projects, activeProject } = useContext(ProjectsContext);
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
          projectid: props.metric.projectid,
          metricid: props.metric.id,
        }),
        credentials: 'include',
      }).then((res) => {
        if (res.ok && projects !== null) {
          toast.success('Metric succesfully deleted');
          setProjects(
            projects?.map((v: Project) =>
              v.id === props.metric.projectid
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
      <DropdownMenu
        open={props.isOpen}
        onOpenChange={(e) => {
          if (projects[activeProject].userrole !== UserRole.Guest) {
            props.setIsOpen(e);
          }
        }}
      >
        <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
        <DropdownMenuContent className='relative right-[20px] w-[150px] shadow-sm'>
          {projects[activeProject].userrole === UserRole.Owner ||
            (projects[activeProject].userrole === UserRole.Admin && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
            ))}
          <DropdownMenuItem
            onClick={(e) => {
              navigator.clipboard.writeText(props.metric.id);
              toast.success('Succefully copied metric ID');
              e.stopPropagation();
            }}
          >
            Copy ID
          </DropdownMenuItem>
          {projects[activeProject].userrole === UserRole.Owner ||
            (projects[activeProject].userrole === UserRole.Admin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    DeleteMetric();
                  }}
                  className={`bg-red-500/0 !text-red-500 transition-all hover:!bg-red-500/20`}
                >
                  Delete
                </DropdownMenuItem>
              </>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
