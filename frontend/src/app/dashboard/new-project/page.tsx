'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import AuthNavbar from '@/components/website/auth-navbar';
import Footer from '@/components/website/footer';
import { ProjectsContext } from '@/dash-context';
import { useRouter } from 'next/navigation';
import { Dispatch, useContext, useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { Step, StepItem, Stepper, useStepper } from '@/components/ui/stepper';
import { useCharacterLimit } from '@/lib/character-limit';

export default function NewProject() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>('');
  const { setActiveProject, projects, setProjects } =
    useContext(ProjectsContext);
  const router = useRouter();

  const steps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
    { label: 'Step 4' },
  ] satisfies StepItem[];

  const handleCreateProject = async () => {
    if (name === '') {
      toast.error('Please choose a valid name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: name.toLowerCase(),
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(errorText);
        setLoading(false);
        return;
      }

      const newProject = await response.json();
      setActiveProject(projects.length);
      localStorage.setItem('activeProject', projects.length.toString());
      setProjects((prevProjects) => [...prevProjects, newProject]);
      router.push('/dashboard');
    } catch (err) {
      toast.error('An error occurred while creating the project');
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col'>
      <WebContainer className='h-[100vh] w-[100vw]'>
        {projects.length === 0 ? (
          <AuthNavbar isDashboard button={null} />
        ) : (
          <AuthNavbar isDashboard href='/dashboard' button='Dashboard' />
        )}
        <ContentContainer className='flex h-full items-center justify-center'>
          <div className='mx-auto flex w-full max-w-[600px] flex-col'>
            <Stepper initialStep={0} steps={steps} size='sm'>
              <Step label='Step 1'>
                <Step1 setName={setName} />
              </Step>
              <Step label='Step 2'>
                <Step2 />
              </Step>
              <Step label='Step 3'>
                <Step3 />
              </Step>
              <Step label='Step 4'>
                <Step4
                  name={name}
                  onCreate={handleCreateProject}
                  loading={loading}
                />
              </Step>
            </Stepper>
          </div>
        </ContentContainer>
      </WebContainer>
      <Footer type='waitlist' border bg='secondary' isHome />
    </div>
  );
}

function Step1({
  setName,
}: {
  setName: Dispatch<React.SetStateAction<string>>;
}) {
  const { nextStep } = useStepper();
  const maxLength = 20; // Character limit for the project name
  const id = useId(); // Unique ID for accessibility
  const {
    value,
    characterCount,
    handleChange: handleCharacterLimitChange,
    maxLength: limit,
  } = useCharacterLimit({ maxLength });

  // Synchronize name with value from useCharacterLimit
  useEffect(() => {
    setName(value);
  }, [value]);

  // Combined change handler
  const handleInputChange = (e: any) => {
    handleCharacterLimitChange(e); // Update character limit
    setName(e.target.value); // Update name state
  };

  return (
    <div className='flex flex-col gap-[5px] md:mt-5'>
      <div className='text-xl font-medium'>Project Name</div>
      <div className='text-sm text-secondary'>
        Choose a name for your project. This will be used to identify it in your
        dashboard.
      </div>
      <div className='mt-5 flex w-full flex-col gap-3'>
        <Label htmlFor={id}>Project name</Label>
        <div className='relative'>
          <Input
            id={id}
            className='peer h-[40px] rounded-[12px] pe-14'
            type='text'
            placeholder='Name...'
            value={value} // Use value from useCharacterLimit
            maxLength={maxLength}
            onChange={handleInputChange} // Use combined handler
            aria-describedby={`${id}-description`}
          />
          <div
            id={`${id}-description`}
            className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50'
            aria-live='polite'
            role='status'
          >
            {characterCount}/{limit}
          </div>
        </div>
      </div>
      <div className='mt-5 flex w-full justify-end'>
        <Button
          className='w-fit rounded-[12px]'
          onClick={nextStep}
          disabled={value === ''} 
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function Step2() {
  const { nextStep, prevStep } = useStepper();

  return (
    <div className='flex flex-col gap-[5px] md:mt-5'>
      <div className='text-xl font-medium'>Choose Plan</div>
      <div className='text-sm text-secondary'>
        Select a plan for your project. (Placeholder for plan selection)
      </div>
      <div className='mt-5 flex w-full justify-between'>
        <Button
          className='w-fit rounded-[12px]'
          variant='secondary'
          onClick={prevStep}
        >
          Back
        </Button>
        <Button className='w-fit rounded-[12px]' onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
}

function Step3() {
  const { nextStep, prevStep } = useStepper();

  return (
    <div className='flex flex-col gap-[5px] md:mt-5'>
      <div className='text-xl font-medium'>Additional Settings</div>
      <div className='text-sm text-secondary'>
        Configure additional settings for your project. (Placeholder for
        settings)
      </div>
      <div className='mt-5 flex w-full justify-between'>
        <Button
          className='w-fit rounded-[12px]'
          variant='secondary'
          onClick={prevStep}
        >
          Back
        </Button>
        <Button className='w-fit rounded-[12px]' onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
}

function Step4({
  name,
  onCreate,
  loading,
}: {
  name: string;
  onCreate: () => void;
  loading: boolean;
}) {
  const { prevStep } = useStepper();

  return (
    <div className='flex flex-col gap-[5px] md:mt-5'>
      <div className='text-xl font-medium'>Overview</div>
      <div className='text-sm text-secondary'>
        Review your project details before creating it.
      </div>
      <div className='mt-5 flex w-full flex-col gap-3'>
        <Label>Project Name</Label>
        <div className='rounded-[12px] bg-background p-3'>{name}</div>
      </div>
      <div className='mt-5 flex w-full justify-between'>
        <Button
          className='w-fit rounded-[12px]'
          variant='secondary'
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          className='w-fit rounded-[12px]'
          onClick={onCreate}
          loading={loading}
        >
          Create Project
        </Button>
      </div>
    </div>
  );
}
