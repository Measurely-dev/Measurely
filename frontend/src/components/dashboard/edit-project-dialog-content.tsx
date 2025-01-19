'use client';
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
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditAppDialogContent(props: {
  project: Project | null;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>('');
  const [file, setFile] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);

  const { projects, setProjects } = useContext(ProjectsContext);

  async function updateProject() {
    if (name !== '' && name !== props.project?.name) {
      await fetch(process.env.NEXT_PUBLIC_API_URL + '/project-name', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          new_name: name,
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
                ? Object.assign({}, proj, { name: name })
                : proj,
            ) ?? [],
          );
        }
      });
    }

    if (file !== null) {
      const formData = new FormData();
      formData.append('file', file);

      await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/project-image/' + props.project?.id,
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

  useEffect(() => {
    setName(props.project?.name ?? '');
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

          if (file !== null) {
            if (file.size > MAXFILESIZE) {
              toast.error('The image is too large, MAX 500KB');
              setLoading(false);
              return;
            }
          }

          await updateProject();
          setLoading(false);
        }}
      >
        <div className='flex flex-row items-center justify-center gap-4'>
          <Avatar className='relative size-[70px] cursor-pointer items-center justify-center overflow-visible !rounded-[16px]'>
            <Label className='relative h-full w-full cursor-pointer'>
              <AvatarImage
                className='rounded-[16px]'
                src={reader === null ? props.project?.image : reader}
                alt='Project image'
              />
              <AvatarFallback className='h-full w-full !rounded-[16px]'>
                <ImageIcon className='text-secondary' />
              </AvatarFallback>
              <Input
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];

                  if (!selectedFile) {
                    return;
                  }

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
            <Label>Project name</Label>
            <Input
              placeholder='Project Name'
              type='text'
              className='h-11 rounded-[12px]'
              value={name}
              onChange={(e) => setName(e.target.value.trimStart())}
            />
          </div>
        </div>
        <div className='flex w-full flex-row gap-2'>
          <DialogClose className='w-full'>
            <Button
              type='button'
              variant='secondary'
              className='w-full rounded-[12px]'
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
            className='w-full rounded-[12px]'
            loading={loading}
            disabled={
              loading ||
              ((name === '' || name === props.project?.name) && file === null)
            }
          >
            Update
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
