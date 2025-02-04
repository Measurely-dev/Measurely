'use client';

// Import required UI components and utilities
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Content from '@/components/page-content';
import SemiNavbar from '@/components/semi-navbar';
import { ProjectsContext } from '@/dash-context';
import { useRouter } from 'next/navigation';
import {
  Dispatch,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { Step, StepItem, Stepper, useStepper } from '@/components/ui/stepper';
import { useCharacterLimit } from '@/lib/character-limit';

// Main component for creating a new project
export default function NewProject() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>('');
  const { setActiveProject, projects, setProjects } =
    useContext(ProjectsContext);
  const router = useRouter();

  // Define the steps for the project creation wizard
  const steps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
    { label: 'Step 4' },
  ] satisfies StepItem[];

  // Handle project creation submission
  const handleCreateProject = async () => {
    if (name === '') {
      toast.error('Please choose a valid name');
      return;
    }

    setLoading(true);

    try {
      // Make API call to create new project
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

      // Handle successful project creation
      const newProject = await response.json();
      newProject.metrics = null;
      newProject.blocks = null;
      newProject.members = null;
      setActiveProject(projects.length);
      setProjects((prevProjects) => [...prevProjects, newProject]);
      router.push('/');
    } catch {
      toast.error('An error occurred while creating the project');
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col h-[100vh] w-[100vw]'>
        {projects.length === 0 ? (
          <SemiNavbar button={null} />
        ) : (
          <SemiNavbar href='/' button='Dashboard' />
        )}
        <Content className='flex h-full items-center justify-center'>
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
        </Content>
      </div>
    </div>
  );
}

// Step 1: Project name input component
function Step1({
  setName,
}: {
  setName: Dispatch<React.SetStateAction<string>>;
}) {
  const { nextStep } = useStepper();
  const { projects } = useContext(ProjectsContext);
  const maxLength = 20;
  const id = useId();

  // Initialize character limit hook
  const {
    value,
    characterCount,
    handleChange: handleCharacterLimitChange,
    maxLength: limit,
  } = useCharacterLimit({ maxLength });

  // Keep name state in sync with input value
  useEffect(() => {
    setName(value);
  }, [value]);

  const handleInputChange = (e: any) => {
    handleCharacterLimitChange(e);
    setName(e.target.value);
  };

  // Check if project name already exists
  const exists = useMemo(() => {
    return projects.some((project) => project.name === value.trim());
  }, [value]);

  return (
    <div className='flex flex-col gap-[5px] md:mt-5'>
      <div className='text-xl font-medium'>Project Name</div>
      <div className='text-sm text-muted-foreground'>
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
            value={value}
            maxLength={maxLength}
            onChange={handleInputChange}
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
          disabled={value === '' || exists}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Step 2: Plan selection component
function Step2() {
  const { nextStep, prevStep } = useStepper();

  return (
    <div className='flex flex-col gap-[5px] md:mt-5'>
      <div className='text-xl font-medium'>Choose Plan</div>
      <div className='text-sm text-muted-foreground'>
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

// Step 3: Additional settings component
function Step3() {
  const { nextStep, prevStep } = useStepper();

  return (
    <div className='flex flex-col gap-[5px] md:mt-5'>
      <div className='text-xl font-medium'>Additional Settings</div>
      <div className='text-sm text-muted-foreground'>
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

// Step 4: Project overview and creation component
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
      <div className='text-sm text-muted-foreground'>
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
