'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import {
  ReactNode,
  useContext,
  useEffect,
  useId,
  useState,
  useRef,
} from 'react';
import { ProjectsContext } from '@/dash-context';
import { Shuffle } from 'lucide-react';
import { useConfirm } from '@omit/react-confirm-dialog';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function ApiDialog(props: {
  children: ReactNode;
  randomize?: boolean | false;
  projectid: string;
}) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const confirm = useConfirm();
  const [apiIndex, setApiIndex] = useState<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input element

  useEffect(() => {
    if (projects !== null) {
      setApiIndex(projects.findIndex((proj) => proj.id === props.projectid));
    }
  }, [projects, props.projectid]);

  const RandomizeAPI = async () => {
    const isConfirmed = await confirm({
      title: 'Randomize API Key',
      icon: <Shuffle className='size-6 text-destructive' />,
      description:
        'Are you sure you want to randomize your API key? This will invalidate the current key, and all requests using it will stop working.',
      confirmText: 'Yes, Randomize',
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
      fetch(process.env.NEXT_PUBLIC_API_URL + '/rand_apikey', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: apiIndex !== undefined ? projects?.[apiIndex].id : '',
        }),
        credentials: 'include',
      })
        .then((res) => {
          if (res.ok === true) {
            return res.text();
          } else {
            toast.error('Failed to generate a new API KEY. Try again later.');
          }
        })
        .then((data) => {
          if (data !== null && data !== undefined && projects !== null) {
            toast.success('API key successfully randomized');
            setProjects(
              projects?.map((v, i) =>
                i === apiIndex
                  ? Object.assign({}, v, {
                      api_key: data,
                    })
                  : v,
              ),
            );
            setApiKey(data);
          }
        });
    }
  };

  useEffect(() => {
    if (projects !== null && projects.length > 0) {
      const appIndex = projects.findIndex((app) => app.id === props.projectid);
      if (appIndex !== -1 && projects[appIndex].api_key !== null) {
        setApiKey(projects[appIndex].api_key);
      }
    }
  }, [activeProject, projects, props.projectid]);

  const toggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
    if (isVisible && inputRef.current) {
      inputRef.current.select(); // Auto-select text when visible
    }
  };

  return (
    <Dialog
      onOpenChange={(e) => {
        if (!e) {
          setIsVisible(false);
        }
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='rounded-xl border border-input p-4 shadow-none max-md:max-w-[95%] max-sm:w-full max-sm:max-w-full max-sm:rounded-none'>
        <DialogHeader className='hidden'>
          <DialogTitle className='sr-only'>API KEY</DialogTitle>
          <DialogDescription className='sr-only'>
            Anyone who has this key will be able to use it.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor={id} className='flex w-full flex-col gap-2'>
            API Key
            <div className='flex w-full items-center gap-2'>
              <div className='relative w-full'>
                <Input
                  id={id}
                  ref={inputRef}
                  className='w-full rounded-[12px] pe-9 text-sm'
                  placeholder='API Key'
                  type={isVisible ? 'text' : 'password'}
                  value={apiKey || ''}
                  readOnly
                  onClick={() => {
                    if (apiKey && isVisible) {
                      navigator.clipboard.writeText(apiKey);
                      toast.success('API key copied to clipboard!');
                    }
                  }}
                />
                <button
                  className='absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                  type='button'
                  onClick={toggleVisibility}
                  aria-label={isVisible ? 'Hide API key' : 'Show API key'}
                  aria-pressed={isVisible}
                  aria-controls={id}
                >
                  {isVisible ? (
                    <EyeOff size={16} strokeWidth={2} aria-hidden='true' />
                  ) : (
                    <Eye size={16} strokeWidth={2} aria-hidden='true' />
                  )}
                </button>
              </div>
              {props.randomize && (
                <Button
                  onClick={RandomizeAPI}
                  size={'icon'}
                  className='size-9 min-w-9 rounded-[12px]'
                  variant={'destructiveOutline'}
                >
                  <Shuffle className='size-4' />
                </Button>
              )}
            </div>
          </Label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
