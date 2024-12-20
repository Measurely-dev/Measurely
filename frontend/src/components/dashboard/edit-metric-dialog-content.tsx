'use client';
// External and components
import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppsContext } from '@/dash-context';
import { Group } from '@/types';
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';

export default function EditMetricDialogContent(props: {
  group: Group;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onUpdate?: (new_name: string) => void;
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
    <DialogContent className='rounded-sm shadow-sm'>
      <DialogHeader className='static'>
        <DialogTitle>Edit metric</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          let group = props.group;

          let res;

          if (name !== props.group.name) {
            res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/group', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                appid: props.group.appid,
                groupid: props.group.id,
                name: name,
              }),
              credentials: 'include',
            });

            if (res.ok && applications !== null) {
              group = Object.assign({}, group, { name: name });
            }
          }

          for (let i = 0; i < subNames.length; i++) {
            if (subNames[i] !== props.group.metrics[i].name) {
              res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/metric', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  appid: props.group.appid,
                  groupid: props.group.id,
                  metricid: props.group.metrics[i].id,
                  name: subNames[i],
                }),
                credentials: 'include',
              });

              if (res.ok && applications !== null) {
                group = Object.assign({}, group, {
                  metrics: group.metrics.map((metric) =>
                    metric.id === props.group.metrics[i].id
                      ? Object.assign({}, metric, {
                          name: subNames[i],
                        })
                      : metric,
                  ),
                });
              }
            }
          }

          if (applications !== null) {
            setApplications(
              applications.map((v) =>
                v.id === props.group.appid
                  ? Object.assign({}, v, {
                      groups: v.groups?.map((g) =>
                        g.id === props.group.id
                          ? Object.assign({}, g, group)
                          : g,
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
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {props.group.type !== 0 ? (
              <>
                <div className='flex w-full flex-col gap-3'>
                  <Label>Positive name</Label>
                  <Input
                    placeholder='New users, Deleted projects, Suspended accounts'
                    type='text'
                    className='h-11 rounded-[12px]'
                    value={subNames[0]}
                    onChange={(e) =>
                      setSubNames(
                        subNames.map((v, i) => (i === 0 ? e.target.value : v)),
                      )
                    }
                  />
                </div>
                <div className='flex w-full flex-col gap-3'>
                  <Label>Negative name</Label>
                  <Input
                    placeholder='New users, Deleted projects, Suspended accounts'
                    type='text'
                    className='h-11 rounded-[12px]'
                    value={subNames[1]}
                    onChange={(e) =>
                      setSubNames(
                        subNames.map((v, i) => (i === 1 ? e.target.value : v)),
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
        <div className='flex w-full flex-row gap-2'>
          <DialogClose className='w-full'>
            <Button
              type='button'
              variant='secondary'
              className='w-full rounded-[12px]'
              onClick={() => {
                setName(props.group.name);
                setSubNames(props.group.metrics.map((m) => m.name));
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type='submit'
            variant='default'
            className='w-full rounded-[12px]'
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
