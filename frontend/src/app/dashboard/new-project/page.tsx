'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import AuthNavbar from '@/components/website/auth-navbar';
import Footer from '@/components/website/footer';
import { ProjectsContext } from '@/dash-context';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dispatch, useContext, useState } from 'react';
import { toast } from 'sonner';
import { loadMetrics, MAXFILESIZE } from '@/utils';
import { Separator } from '@/components/ui/separator';

export default function NewProject() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  const { setActiveProject, projects, setProjects } =
    useContext(ProjectsContext);

  function createApp() {
    if (name === '') {
      toast.error('Please choose a valid name');
      setLoading(false);
      return;
    }

    fetch(process.env.NEXT_PUBLIC_API_URL + '/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: name,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          res.text().then((text) => {
            toast.error(text);
            setLoading(false);
          });
        } else {
          return res.json();
        }
      })
      .then(async (json) => {
        if (file !== null) {
          const formData = new FormData();
          formData.append('file', file);

          fetch(process.env.NEXT_PUBLIC_API_URL + '/app-image/' + json.id, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          })
            .then((res) => {
              if (res.ok) {
                return res.json();
              }
            })
            .then((url) => {
              if (url !== undefined) {
                json.image = url;
              }
            });
        }

        json.metrics = await loadMetrics(json.id);
        setProjects((apps) => [...apps, json]);
        setActiveProject(projects.length - 1);
        localStorage.setItem('activeProject', (projects.length - 1).toString());
        router.push('/dashboard');
      });
  }

  return (
    <div className='flex flex-col'>
      <WebContainer className='h-[100vh] w-[100vw]'>
        {projects.length === 0 ? (
          <AuthNavbar isDashboard button={null} />
        ) : (
          <AuthNavbar isDashboard href='/dashboard' button='Dashboard' />
        )}
        <ContentContainer className='flex h-full items-center justify-center'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);

              if (file !== null) {
                if (file.size > MAXFILESIZE) {
                  toast.error('The image is too large, MAX 500KB');
                  setLoading(false);
                  return;
                }
              }

              createApp();
            }}
          >
            <div className='mx-auto flex w-full max-w-[500px] flex-col gap-6 rounded-3xl bg-accent max-md:max-w-[95%]'>
              <div className='flex flex-col gap-[5px] p-6 border-b'>
                <div className='text-xl font-medium'>
                  {projects === null
                    ? 'Start your first project'
                    : 'Start a new project'}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Set up a new project to start tracking metrics and managing
                  your data efficiently
                </div>
              </div>
              <Inputs
                name={name}
                setName={setName}
                file={file}
                setFile={setFile}
              />
              <Separator />
              <div className='flex w-full justify-end p-6 pt-0'>
                <Button
                  className='group w-fit rounded-[12px]'
                  type='submit'
                  loading={loading}
                  disabled={loading || name === ''}
                >
                  Create project{' '}
                  <ArrowRight className='ml-2 size-4 transition-all duration-200 group-hover:ml-4' />
                </Button>
              </div>
            </div>
          </form>
        </ContentContainer>
      </WebContainer>
      <Footer border bg='secondary' isHome />
    </div>
  );
}

function Inputs(props: {
  name: string;
  setName: Dispatch<React.SetStateAction<string>>;
  file: any;
  setFile: Dispatch<React.SetStateAction<any>>;
}) {
  const [reader, setReader] = useState<any>(null);

  return (
    <div className='flex flex-col gap-[15px] px-6'>
      <div className='flex w-full items-center gap-5'>
        <Avatar className='relative size-[65px] cursor-pointer items-center justify-center overflow-visible !rounded-full bg-background'>
          <Label className='relative h-full w-full cursor-pointer'>
            <AvatarImage
              className='rounded-full'
              src={reader}
              alt='Project image'
            />
            <AvatarFallback className='h-full w-full !rounded-full bg-background'>
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
                props.setFile(event.target.files?.[0]);
              }}
              type='file'
              accept='.jpg, .jpeg, .png, .webp .svg'
              className='absolute left-0 top-0 h-full w-full cursor-pointer bg-background opacity-0'
            />
          </Label>
        </Avatar>
        <Label className='flex w-full flex-col gap-2'>
          Project name
          <Input
            value={props.name}
            type='text'
            maxLength={20}
            onChange={(e) => props.setName(e.target.value.trimStart())}
            className='h-[40px] rounded-[12px] border-none bg-background'
            placeholder='Name...'
          />
        </Label>
      </div>
    </div>
  );
}
