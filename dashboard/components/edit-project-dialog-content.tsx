'use client';

// UI Component imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectsContext } from '@/dash-context';
import { Project } from '@/types';
import { MAXFILESIZE } from '@/utils';
import { ImageIcon } from 'lucide-react';
import { useContext, useEffect, useState, useId } from 'react';
import { toast } from 'sonner';
import { useCharacterLimit } from '@/utils';

// Dialog content component for editing project details
export default function EditAppDialogContent(props: {
  project: Project | null;
}) {
  // State management for loading, file upload and preview
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const { projects, setProjects } = useContext(ProjectsContext);

  // Configuration for project name input
  const maxLength = 20;
  const id = useId();
  const {
    value,
    characterCount,
    handleChange: handleCharacterLimitChange,
    maxLength: limit,
  } = useCharacterLimit({ maxLength });

  // Initialize project name when project prop changes
  useEffect(() => {
    if (props.project?.name) {
      const syntheticEvent = {
        target: {
          value: props.project.name,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      handleCharacterLimitChange(syntheticEvent);
    }
  }, [props.project]);

  // Handle project updates (name and image)
  async function updateProject() {
    // Update project name if changed
    if (value !== '' && value !== props.project?.name) {
      await fetch(process.env.NEXT_PUBLIC_API_URL + '/project_name', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          new_name: value,
          project_id: props.project?.id,
        }),
      }).then((res) => {
        if (!res.ok) {
          res.text().then((text) => {
            toast.error(text);
          });
        } else {
          toast.success('Successfully updated the project name');
          setProjects(
            projects?.map((proj) =>
              proj.id === props.project?.id
                ? Object.assign({}, proj, { name: value })
                : proj,
            ) ?? [],
          );
        }
      });
    }

    // Update project image if file selected
    if (file !== null) {
      const formData = new FormData();
      formData.append('file', file);

      await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/project_image/' + props.project?.id,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        },
      )
        .then((res) => {
          if (res.ok) {
            toast.success('Successfully updated the project image');
            return res.json();
          } else {
            res.text().then((text) => {
              toast.error(text);
            });
          }
        })
        .then((url) => {
          if (url === undefined) return;
          setProjects(
            projects?.map((proj) =>
              proj.id === props.project?.id
                ? Object.assign({}, proj, {
                    image: url,
                  })
                : proj,
            ) ?? [],
          );
        });
    }
  }

  // Reset file state when project changes
  useEffect(() => {
    setFile(null);
    setReader(null);
  }, [props.project]);

  return (
    <DialogContent className='rounded-sm shadow-sm'>
      <DialogHeader className='static'>
        <DialogTitle>Edit Project</DialogTitle>
      </DialogHeader>
      <form
        className='flex flex-col gap-4'
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);

          if (file !== null && file.size > MAXFILESIZE) {
            toast.error('The image is too large, MAX 500KB');
            setLoading(false);
            return;
          }

          await updateProject();
          setLoading(false);
        }}
      >
        <div className='flex flex-row items-center justify-center gap-4'>
          <Avatar className='relative size-[70px] cursor-pointer items-center justify-center overflow-visible'>
            <Label className='relative h-full w-full cursor-pointer'>
              <AvatarImage
                className='rounded-[16px]'
                src={reader === null ? props.project?.image : reader}
                alt='Project image'
              />
              <AvatarFallback className='h-full w-full'>
                <ImageIcon className='text-muted-foreground' />
              </AvatarFallback>
              <Input
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];
                  if (!selectedFile) return;

                  const r = new FileReader();
                  r.onload = (e) => {
                    setReader(e.target?.result);
                  };
                  r.readAsDataURL(selectedFile);
                  setFile(event.target.files?.[0]);
                }}
                type='file'
                accept='.jpg, .jpeg, .png, .webp .svg'
                className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
              />
            </Label>
          </Avatar>
          <div className='flex w-full flex-col gap-3'>
            <Label htmlFor={id}>Project name</Label>
            <div className='relative'>
              <Input
                id={id}
                placeholder='Project Name'
                type='text'
                className='h-11 rounded-[12px] pe-14'
                value={value}
                maxLength={maxLength}
                onChange={handleCharacterLimitChange}
                aria-describedby={`${id}-description`}
              />
              <div
                id={`${id}-description`}
                className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground'
                aria-live='polite'
                role='status'
              >
                {characterCount}/{limit}
              </div>
            </div>
          </div>
        </div>
        <div className='flex w-full flex-row justify-end gap-2'>
          <DialogClose className='w-fit' asChild>
            <Button
              type='button'
              variant='secondary'
              className='w-fit rounded-[12px]'
              onClick={() => {
                setLoading(false);
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
              loading ||
              ((value === '' || value === props.project?.name) && file === null)
            }
          >
            Update
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
