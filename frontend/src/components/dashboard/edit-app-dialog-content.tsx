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
import { AppsContext } from '@/dash-context';
import { Application } from '@/types';
import { MAXFILESIZE } from '@/utils';
import { Image } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditAppDialogContent(props: {
  app: Application | null;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>('');
  const [file, setFile] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);

  const { applications, setApplications } = useContext(AppsContext);

  async function updateApplication() {
    if (name !== '' && name !== props.app?.name) {
      await fetch(process.env.NEXT_PUBLIC_API_URL + '/app-name', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          new_name: name,
          app_id: props.app?.id,
        }),
      }).then((res) => {
        if (!res.ok) {
          res.text().then((text) => {
            toast.error(text);
          });
        } else {
          toast.success('Successfully updated the application name');
          setApplications(
            applications?.map((app) =>
              app.id === props.app?.id
                ? Object.assign({}, app, { name: name })
                : app,
            ) ?? [],
          );
        }
      });
    }

    if (file !== null) {
      const formData = new FormData();
      formData.append('file', file);

      await fetch(
        process.env.NEXT_PUBLIC_FILE_URL + '/app-upload?appid=' + props.app?.id,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        },
      ).then((res) => {
        if (res.ok) {
          toast.success('Successfully updated the application image');
          setApplications(
            applications?.map((app) =>
              app.id === props.app?.id
                ? Object.assign({}, app, { image: `app_${props.app?.id}?random=${Math.random()}`})
                : app,
            ) ?? [],
          );
        } else {
          res.text().then((text) => {
            toast.error(text);
          });
        }
      });
    }
  }

  useEffect(() => {
    setName(props.app?.name ?? '');
    setFile(null);
    setReader(null);
  }, [props.app]);

  return (
    <DialogContent className='rounded-sm shadow-sm'>
      <DialogHeader className='static'>
        <DialogTitle>Edit application</DialogTitle>
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

          await updateApplication();
          setLoading(false);
        }}
      >
        <div className='flex flex-row items-center justify-center gap-4'>
          <Avatar className='relative size-[70px] cursor-pointer items-center justify-center overflow-visible !rounded-[16px]'>
            <Label className='relative h-full w-full cursor-pointer'>
              <AvatarImage
                className='rounded-[16px]'
                src={
                  reader === null
                    ? `${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${props.app?.image}`
                    : reader
                }
                alt='Application image'
              />
              <AvatarFallback className='h-full w-full !rounded-[16px]'>
                <Image className='text-secondary' />
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
            <Label>Application name</Label>
            <Input
              placeholder='Application Name'
              type='text'
              className='h-11 rounded-[12px]'
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              ((name === '' || name === props.app?.name) && file === null)
            }
          >
            Update
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
