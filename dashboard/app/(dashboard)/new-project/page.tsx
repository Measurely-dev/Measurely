"use client";

// Import required UI components and utilities
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Content from "@/components/page-content";
import SemiNavbar from "@/components/semi-navbar";
import { ProjectsContext } from "@/dash-context";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useCharacterLimit } from "@/utils";
import { Step, StepProgressBar, useStep } from "@/components/ui/step";

// Main component for creating a new project
export default function NewProject() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const { setActiveProject, projects, setProjects } =
    useContext(ProjectsContext);
  const router = useRouter();

  // Define steps and useStep hook for navigation
  const { step, nextStep, prevStep } = useStep(4); // 4 steps in total

  // Handle project creation submission
  const handleCreateProject = async () => {
    if (name === "") {
      toast.error("Please choose a valid name");
      return;
    }

    setLoading(true);

    try {
      // Make API call to create new project
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/project",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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
      router.push("/");
    } catch {
      toast.error("An error occurred while creating the project");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      <div className="flex flex-col flex-grow">
        {projects.length === 0 ? (
          <SemiNavbar button={null} />
        ) : (
          <SemiNavbar href="/" button="Dashboard" />
        )}
        <Content className="flex flex-grow pt-[50px] pb-10">
          <div className="mx-auto flex w-full max-w-[600px] flex-col px-4">
            <StepProgressBar step={step + 1} totalSteps={4} />
            {step === 0 && (
              <Step>
                <Step1 name={name} setName={setName} nextStep={nextStep} />
              </Step>
            )}
            {step === 1 && (
              <Step>
                <Step2 nextStep={nextStep} prevStep={prevStep} />
              </Step>
            )}
            {step === 2 && (
              <Step>
                <Step3 nextStep={nextStep} prevStep={prevStep} />
              </Step>
            )}
            {step === 3 && (
              <Step>
                <Step4
                  name={name}
                  onCreate={handleCreateProject}
                  loading={loading}
                  prevStep={prevStep}
                />
              </Step>
            )}
          </div>
        </Content>
      </div>
    </div>
  );
}

// Step 1: Project name input component
function Step1({
  name,
  setName,
  nextStep,
}: {
  name: string;
  setName: Dispatch<React.SetStateAction<string>>;
  nextStep: () => void;
}) {
  const { projects } = useContext(ProjectsContext);
  const maxLength = 20;
  const id = useId();

  // Initialize character limit hook with initial value
  const {
    value,
    characterCount,
    handleChange: handleCharacterLimitChange,
    maxLength: limit,
  } = useCharacterLimit({ maxLength, initialValue: name });

  // Keep name state in sync with input value
  useEffect(() => {
    setName(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCharacterLimitChange(e);
    setName(e.target.value);
  };

  // Check if project name already exists
  const exists = useMemo(() => {
    return projects.some((project) => project.name === value.trim());
  }, [value]);

  return (
    <div className="flex flex-col gap-[5px] md:mt-5">
      <div className="text-xl font-medium">Project Name</div>
      <div className="text-sm text-muted-foreground">
        Choose a name for your project. This will be used to identify it in your
        dashboard.
      </div>
      <div className="mt-5 flex w-full flex-col gap-3">
        <Label htmlFor={id}>Project name</Label>
        <div className="relative">
          <Input
            id={id}
            className="peer h-[40px] rounded-[12px] pe-14"
            type="text"
            placeholder="Name..."
            value={value}
            maxLength={maxLength}
            onChange={handleInputChange}
            aria-describedby={`${id}-description`}
          />
          <div
            id={`${id}-description`}
            className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50"
            aria-live="polite"
            role="status"
          >
            {characterCount}/{limit}
          </div>
        </div>
      </div>
      <div className="mt-5 flex w-full">
        <Button
          className="w-full rounded-[12px]"
          onClick={nextStep}
          disabled={value === "" || exists}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Step 2: Plan selection component
function Step2({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  return (
    <div className="flex flex-col gap-[5px] md:mt-5">
      <div className="text-xl font-medium">Choose Plan</div>
      <div className="text-sm text-muted-foreground">
        Select a plan for your project. (Placeholder for plan selection)
      </div>
      <div className="mt-5 flex w-full justify-end gap-2">
        <Button
          className="w-full rounded-[12px]"
          variant="secondary"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button className="w-full rounded-[12px]" onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
}

// Step 3: Additional settings component
function Step3({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  return (
    <div className="flex flex-col gap-[5px] md:mt-5">
      <div className="text-xl font-medium">Additional Settings</div>
      <div className="text-sm text-muted-foreground">
        Configure additional settings for your project. (Placeholder for
        settings)
      </div>
      <div className="mt-5 flex w-full justify-end gap-2">
        <Button
          className="w-full rounded-[12px]"
          variant="secondary"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button className="w-full rounded-[12px]" onClick={nextStep}>
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
  prevStep,
}: {
  name: string;
  onCreate: () => void;
  loading: boolean;
  prevStep: () => void;
}) {
  return (
    <div className="flex flex-col gap-[5px] md:mt-5">
      <div className="text-xl font-medium">Overview</div>
      <div className="text-sm text-muted-foreground">
        Review your project details before creating it.
      </div>
      <div className="mt-5 flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Label>Project Name</Label>
          <div className="rounded-[12px] bg-card min-h-[45px] h-[45px] flex items-center px-6 text-sm">
            {name}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label>Selected Plan</Label>
          <div className="rounded-[12px] bg-card min-h-[45px] h-[45px] flex items-center px-2 text-sm">
            <div className="bg-background p-1 px-3 border rounded-full w-fit">
              Free Plan
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label>Additional Settings</Label>
          <div className="rounded-[12px] bg-card min-h-[45px] h-[45px] flex items-center px-6 text-sm">
            Default Settings
          </div>
        </div>
      </div>
      <div className="mt-5 flex w-full justify-end gap-2">
        <Button
          className="w-full rounded-[12px]"
          variant="secondary"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          className="w-full rounded-[12px]"
          onClick={onCreate}
          loading={loading}
        >
          Create Project
        </Button>
      </div>
    </div>
  );
}
