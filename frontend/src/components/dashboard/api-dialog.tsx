'use client';

// Import UI components and utilities
import { Button } from '@/components/ui/button';
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
import {
  FloatingPanelBody,
  FloatingPanelContent,
  FloatingPanelRoot,
  FloatingPanelTrigger,
} from '../ui/floating-panel';

// ApiDialog component for displaying and managing API keys
export default function ApiDialog(props: {
  children: ReactNode;
  randomize?: boolean | false;
  projectid: string;
  className?: string;
}) {
  // State management
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const confirm = useConfirm();
  const [apiIndex, setApiIndex] = useState<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [apiKeyDup, setApiKeyDup] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState<boolean>(false);

  // Update apiIndex when projects or projectid changes
  useEffect(() => {
    if (projects !== null) {
      setApiIndex(projects.findIndex((proj) => proj.id === props.projectid));
    }
  }, [projects, props.projectid]);

  // Handle API key randomization with confirmation
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
      // Make API call to randomize the key
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
            setApiKeyDup(data);
          }
        });
    }
  };

  // Initialize API key from projects when component mounts
  useEffect(() => {
    if (projects !== null && projects.length > 0) {
      const appIndex = projects.findIndex((app) => app.id === props.projectid);
      if (appIndex !== -1 && projects[appIndex].api_key !== null) {
        setApiKey(projects[appIndex].api_key);
        setApiKeyDup(projects[appIndex].api_key);
      }
    }
  }, [activeProject, projects, props.projectid]);

  // Toggle API key visibility and handle text selection
  const toggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
    if (isVisible && inputRef.current) {
      inputRef.current.select();
    }
  };

  return (
    <FloatingPanelRoot onOpenChange={(e) => !e && setIsVisible(false)}>
      <FloatingPanelTrigger
        className={`w-fit ${props.className}`}
        title='API Key'
        description='Manage your API key'
      >
        {props.children}
      </FloatingPanelTrigger>
      <FloatingPanelContent className='w-[95%] max-w-[500px]' side='center'>
        <FloatingPanelBody className='p-4'>
          <div className='space-y-2'>
            <div className='flex w-full items-center gap-2'>
              <div className='relative w-full'>
                <div
                  onClick={() => {
                    if (apiKey && isVisible && !isCopying) {
                      navigator.clipboard.writeText(apiKeyDup || '');
                      setIsCopying(true);
                      setApiKey('Copied to clipboard!');
                      setTimeout(() => {
                        setApiKey(apiKeyDup);
                        setIsCopying(false);
                      }, 1500);
                    }
                  }}
                >
                  <Input
                    id={id}
                    ref={inputRef}
                    className='user-select-none pointer-events-none w-full select-none rounded-[12px] pe-9 text-sm !ring-0'
                    placeholder='API Key'
                    type={isVisible ? 'text' : 'password'}
                    value={apiKey || ''}
                    autoFocus={false}
                    readOnly
                    tabIndex={-1}
                  />
                </div>
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
          </div>
        </FloatingPanelBody>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}
