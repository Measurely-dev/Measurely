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
import { Dispatch, SetStateAction, useContext, useState, useId } from 'react';
import { toast } from 'sonner';
import { useCharacterLimit } from '@/lib/character-limit'; // Assuming this hook exists

export default function EditMetricDialogContent(props: {
  metric: Metric | null | undefined;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onUpdate?: (new_name: string) => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const { projects, setProjects } = useContext(ProjectsContext);

  // Character limit for inputs
  const maxLength = 30; // Adjust as needed
  const nameId = useId(); // Unique ID for metric name
  const posNameId = useId(); // Unique ID for positive name
  const negNameId = useId(); // Unique ID for negative name

  // Metric name input
  const {
    value: name,
    characterCount: nameCharacterCount,
    handleChange: handleNameChange,
    maxLength: nameLimit,
  } = useCharacterLimit({ maxLength, initialValue: props.metric?.name ?? '' });

  // Positive name input
  const {
    value: posName,
    characterCount: posNameCharacterCount,
    handleChange: handlePosNameChange,
    maxLength: posNameLimit,
  } = useCharacterLimit({
    maxLength,
    initialValue: props.metric?.name_pos ?? '',
  });

  // Negative name input
  const {
    value: negName,
    characterCount: negNameCharacterCount,
    handleChange: handleNegNameChange,
    maxLength: negNameLimit,
  } = useCharacterLimit({
    maxLength,
    initialValue: props.metric?.name_neg ?? '',
  });

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

          if (
            name !== props.metric?.name ||
            posName !== props.metric.name_pos ||
            negName !== props.metric.name_neg
          ) {
            res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/metric', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                project_id: props.metric?.project_id,
                metric_id: props.metric?.id,
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
                v.id === props.metric?.project_id
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
          toast.success('Metric successfully edited');
          if (props.onUpdate) {
            props.onUpdate(name);
          }
        }}
        className='flex flex-col gap-4'
      >
        <div className='flex w-full flex-col gap-3'>
          <div className='flex flex-col gap-4'>
            {/* Metric Name Input */}
            <div className='min-w-[300px] space-y-2'>
              <Label htmlFor={nameId}>Metric name</Label>
              <div className='relative'>
                <Input
                  id={nameId}
                  className='peer h-11 rounded-[12px] pe-14'
                  type='text'
                  placeholder='New users, Deleted projects, Suspended accounts'
                  value={name}
                  maxLength={maxLength}
                  onChange={handleNameChange}
                  aria-describedby={`${nameId}-description`}
                />
                <div
                  id={`${nameId}-description`}
                  className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50'
                  aria-live='polite'
                  role='status'
                >
                  {nameCharacterCount}/{nameLimit}
                </div>
              </div>
            </div>

            {/* Positive Name Input (for Dual Metrics) */}
            {props.metric?.type === MetricType.Dual && (
              <div className='min-w-[300px] space-y-2'>
                <Label htmlFor={posNameId}>Positive name</Label>
                <div className='relative'>
                  <Input
                    id={posNameId}
                    className='peer h-11 rounded-[12px] pe-14'
                    type='text'
                    placeholder='New users, Deleted projects, Suspended accounts'
                    value={posName}
                    maxLength={maxLength}
                    onChange={handlePosNameChange}
                    aria-describedby={`${posNameId}-description`}
                  />
                  <div
                    id={`${posNameId}-description`}
                    className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50'
                    aria-live='polite'
                    role='status'
                  >
                    {posNameCharacterCount}/{posNameLimit}
                  </div>
                </div>
              </div>
            )}

            {/* Negative Name Input (for Dual Metrics) */}
            {props.metric?.type === MetricType.Dual && (
              <div className='min-w-[300px] space-y-2'>
                <Label htmlFor={negNameId}>Negative name</Label>
                <div className='relative'>
                  <Input
                    id={negNameId}
                    className='peer h-11 rounded-[12px] pe-14'
                    type='text'
                    placeholder='New users, Deleted projects, Suspended accounts'
                    value={negName}
                    maxLength={maxLength}
                    onChange={handleNegNameChange}
                    aria-describedby={`${negNameId}-description`}
                  />
                  <div
                    id={`${negNameId}-description`}
                    className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50'
                    aria-live='polite'
                    role='status'
                  >
                    {negNameCharacterCount}/{negNameLimit}
                  </div>
                </div>
              </div>
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
                // Create synthetic event-like objects to reset values
                const nameEvent = {
                  target: { value: props.metric?.name ?? '' },
                } as React.ChangeEvent<HTMLInputElement>;
                const posNameEvent = {
                  target: { value: props.metric?.name_pos ?? '' },
                } as React.ChangeEvent<HTMLInputElement>;
                const negNameEvent = {
                  target: { value: props.metric?.name_neg ?? '' },
                } as React.ChangeEvent<HTMLInputElement>;

                handleNameChange(nameEvent);
                handlePosNameChange(posNameEvent);
                handleNegNameChange(negNameEvent);
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
                props.metric?.name_pos === posName &&
                props.metric?.name_neg === negName) ||
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
