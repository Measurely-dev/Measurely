'use client';

// Import UI components and utilities
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
import { useCharacterLimit } from '@/lib/character-limit';

/**
 * Component for editing metric properties in a dialog
 * Handles both single metrics and dual metrics with positive/negative values
 */
export default function EditMetricDialogContent(props: {
  metric: Metric | null | undefined;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onUpdate?: (new_name: string) => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const { projects, setProjects } = useContext(ProjectsContext);

  // Generate unique IDs for form fields
  const maxLength = 30;
  const nameId = useId();
  const posNameId = useId(); 
  const negNameId = useId();

  // Setup character-limited input handlers for metric names
  const {
    value: name,
    characterCount: nameCharacterCount,
    handleChange: handleNameChange,
    maxLength: nameLimit,
  } = useCharacterLimit({ maxLength, initialValue: props.metric?.name ?? '' });

  const {
    value: posName,
    characterCount: posNameCharacterCount,
    handleChange: handlePosNameChange,
    maxLength: posNameLimit,
  } = useCharacterLimit({
    maxLength,
    initialValue: props.metric?.name_pos ?? '',
  });

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

          // Validate metric name
          if (name === '') {
            toast.error('A metric must have a name');
            setLoading(false);
            return;
          }

          // Additional validation for dual metrics
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

          // Only update if values have changed
          if (
            name !== props.metric?.name ||
            posName !== props.metric.name_pos ||
            negName !== props.metric.name_neg
          ) {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/metric', {
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

          // Update local project state
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
