'use client';
// External and components
import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectsContext } from '@/dash-context';
import { Metric, MetricType, Project } from '@/types';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { toast } from 'sonner';

export default function EditMetricDialogContent(props: {
  metric: Metric | null | undefined;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onUpdate?: (new_name: string) => void;
}) {
  const [name, setName] = useState<string>(props.metric?.name ?? '');
  const [posName, setPosName] = useState<string>(props.metric?.namepos ?? '');
  const [negName, setNegName] = useState<string>(props.metric?.nameneg ?? '');
  const [loading, setLoading] = useState<boolean>(false);
  const { projects, setProjects } = useContext(ProjectsContext);

  return (
    <DialogContent className='rounded-sm shadow-sm'>
      <DialogHeader className='static'>
        <DialogTitle>Edit metric</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          let metric = props.metric;

          let res;

          if (name === '') {
            toast.error('A metric must have a name');
            setLoading(false);
            return;
          }

          if (props.metric?.type === MetricType.Dual) {
            if (posName === '' || negName === '') {
              toast.error('A dual metric must have variable names');
              setLoading(false);
              return;
            } else if (
              posName.toLowerCase() === 'total' ||
              negName.toLowerCase() === 'total'
            ) {
              toast.error("You cannot use the name 'total' for your variables");
              setLoading(false);
              return;
            }
          }

          if (name !== props.metric?.name || posName !== props.metric.namepos || negName !== props.metric.nameneg) {
            res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/metric', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectid: props.metric?.projectid,
                metricid: props.metric?.id,
                name: name,
                namepos: posName,
                nameneg: negName,
              }),
              credentials: 'include',
            });


            if (res.ok && projects !== null) {
              metric = Object.assign({}, metric, {
                name: name,
                namepos: posName,
                nameneg: negName,
              });
            }
          }

          if (projects !== null) {
            setProjects(
              projects.map((v: Project) =>
                v.id === props.metric?.projectid
                  ? Object.assign({}, v, {
                    metrics: v.metrics?.map((m) =>
                      m.id === props.metric?.id
                        ? Object.assign({}, m, metric)
                        : m,
                    ),
                  })
                  : v,
              ),
            );
          }
          setLoading(false);
          props.setOpen(false);
          toast.success('Metric succesfully edited');
          if (props.onUpdate) {
            props.onUpdate(name);
          }
        }}
        className='flex flex-col gap-4'
      >
        <div className='flex w-full flex-col gap-3'>
          <div className='flex flex-col gap-4'>
            <div className='flex w-full flex-col gap-3'>
              <Label>Metric name</Label>
              <Input
                placeholder='New users, Deleted projects, Suspended accounts'
                type='text'
                className='h-11 rounded-[12px]'
                value={name}
                onChange={(e) => setName(e.target.value.trimStart())}
              />
            </div>
            {props.metric?.type === MetricType.Dual ? (
              <>
                <div className='flex w-full flex-col gap-3'>
                  <Label>Positive name</Label>
                  <Input
                    placeholder='New users, Deleted projects, Suspended accounts'
                    type='text'
                    className='h-11 rounded-[12px]'
                    value={posName}
                    onChange={(e) => setPosName(e.target.value.trimStart())}
                  />
                </div>
                <div className='flex w-full flex-col gap-3'>
                  <Label>Negative name</Label>
                  <Input
                    placeholder='New users, Deleted projects, Suspended accounts'
                    type='text'
                    className='h-11 rounded-[12px]'
                    value={negName}
                    onChange={(e) => setNegName(e.target.value.trimStart())}
                  />
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose className='w-fit'>
            <Button
              type='button'
              variant='secondary'
              className='w-full rounded-[12px]'
              onClick={() => {
                setName(props.metric?.name ?? '');
                setPosName(props.metric?.namepos ?? '');
                setNegName(props.metric?.nameneg ?? '');
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type='submit'
            variant='default'
            className='w-fit rounded-[12px]'
            loading={loading}
            disabled={
              (name === props.metric?.name &&
                props.metric?.namepos === posName &&
                props.metric?.nameneg === negName) ||
              loading
            }
          >
            Update
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
