'use client';

// Import UI components and utilities
import { Button } from '@/components/ui/button';
import { ProjectsContext } from '@/dash-context';
import { useConfirm } from '@omit/react-confirm-dialog';
import { Eye, EyeOff, Shuffle } from 'lucide-react';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FloatingPanelBody,
  FloatingPanelContent,
  FloatingPanelRoot,
  FloatingPanelTrigger,
} from './ui/floating-panel';

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
          <div className='flex w-full items-center'>
            <Button
              onClick={() => {
                if (apiKey && !isCopying) {
                  navigator.clipboard.writeText(apiKeyDup || '');
                  setIsVisible(true);
                  setIsCopying(true);
                  setApiKey('Copied to clipboard!');
                  setTimeout(() => {
                    setApiKey(apiKeyDup);
                    setIsVisible(false);
                    setIsCopying(false);
                  }, 1500);
                }
              }}
              className='w-full rounded-[12px] rounded-e-none'
              variant='outline'
            >
              {isVisible ? apiKey : 'Click to copy API key'}
            </Button>
            <Button
              className='size-9 min-w-9 rounded-[12px] rounded-s-none border-s-0'
              variant='outline'
              size={'icon'}
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeOff size={16} strokeWidth={2} aria-hidden='true' />
              ) : (
                <Eye size={16} strokeWidth={2} aria-hidden='true' />
              )}
            </Button>
            {props.randomize && (
              <Button
                onClick={RandomizeAPI}
                size={'icon'}
                className='ml-2 size-9 min-w-9 rounded-[12px]'
                variant={'destructiveOutline'}
              >
                <Shuffle className='size-4' />
              </Button>
            )}
          </div>
        </FloatingPanelBody>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}
