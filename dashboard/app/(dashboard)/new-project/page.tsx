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
import {
  calculatePrice,
  getEventAmount,
  getEventCount,
  getSliderValue,
  useCharacterLimit,
} from "@/utils";
import { Step, StepProgressBar, useStep } from "@/components/ui/step";
import { plans } from "@/plans";
import { PricingOptions } from "@/components/global/pricing-options";
import Link from "next/link";
import PricingCard from "@/components/global/pricing-card";

// Main component for creating a new project
export default function NewProject() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const [eventCount, setEventCount] = useState<string>("0");
  const { setActiveProject, projects, setProjects } =
    useContext(ProjectsContext);
  const router = useRouter();

  // Define steps and useStep hook for navigation
  const { step, nextStep, prevStep } = useStep(3); // 3 steps in total
  const [selectedPlan, setSelectedPlan] = useState<string>("");

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
            eventCount,
          }),
        }
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
            <StepProgressBar step={step + 1} totalSteps={3} />
            {step === 0 && (
              <Step>
                <Step1 name={name} setName={setName} nextStep={nextStep} />
              </Step>
            )}
            {step === 1 && (
              <Step>
                <Step2
                  nextStep={nextStep}
                  prevStep={prevStep}
                  selectedPlan={selectedPlan}
                  setSelectedPlan={setSelectedPlan}
                  setEventCount={setEventCount}
                />
              </Step>
            )}
            {step === 2 && (
              <Step>
                <Step3
                  name={name}
                  onCreate={handleCreateProject}
                  loading={loading}
                  prevStep={prevStep}
                  selectedPlan={selectedPlan}
                  eventCount={eventCount}
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

function Step2({
  nextStep,
  prevStep,
  selectedPlan,
  setSelectedPlan,
  setEventCount,
}: {
  nextStep: () => void;
  prevStep: () => void;
  selectedPlan: string;
  setSelectedPlan: (value: string) => void;
  setEventCount: Dispatch<React.SetStateAction<string>>;
}) {
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");

  useEffect(() => {
    setEventCount(() => getEventAmount(sliderValue[0]));
  }, [sliderValue]);

  return (
    <div className="flex flex-col gap-[5px] md:mt-5">
      <div className="text-xl font-medium">Choose Plan</div>
      <div className="text-sm text-muted-foreground">
        Select a plan for your project -{" "}
        <Link className="text-blue-500" href="https://measurely.dev/pricing">
          Additional information about plans.
        </Link>
      </div>
      <PricingOptions
        className="gap-8 mt-5 max-sm:flex-col max-sm:items-center"
        billingPeriod={billingPeriod}
        setBillingPeriod={setBillingPeriod}
        setSliderValue={setSliderValue}
        sliderValue={sliderValue}
        type="dialog"
      />
      <div className="mt-5 space-y-3">
        {plans.map((plan, i) => {
          const price = calculatePrice(
            plan.price,
            plan.identifier,
            getEventCount(sliderValue[0]),
            billingPeriod
          );
          return (
            <Pricing
              key={i}
              name={plan.name}
              value={plan.identifier}
              description={`${plan.description}`}
              state={selectedPlan}
              setState={setSelectedPlan}
              recurrence={plan.name === "Starter" ? "forever" : billingPeriod}
              price={price}
              eventCount={getEventAmount(sliderValue[0])}
            />
          );
        })}
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

function Pricing({
  name,
  value,
  description,
  state,
  setState,
  price,
  recurrence,
  eventCount,
}: {
  name: string;
  value: string;
  description: string;
  state: string;
  price: number;
  recurrence: string;
  eventCount: string;
  setState: (value: string) => void;
}) {
  const isFree = recurrence === "forever";
  const isYearly = recurrence === "year";
  const isMonthly = recurrence === "month";

  return (
    <div
      className={`flex w-full select-none flex-col gap-3 rounded-xl border relative p-3 shadow-sm shadow-black/5 transition-all duration-150 ${
        state === value
          ? "cursor-pointer bg-accent/50 ring-2 ring-primary/75"
          : "cursor-pointer hover:bg-accent/50"
      }`}
      onClick={() => setState(value)}
    >
      <div className="p-1 rounded-lg border bg-accent dark:bg-card absolute text-sm right-3">
        {isFree ? "5K" : eventCount} events
      </div>
      <div className="w-full flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="text-lg font-medium">{name}</div>
        </div>
        <div className="text-xs font-light text-muted-foreground">
          {description}
        </div>
      </div>
      <div className="flex flex-row gap-1.5 whitespace-nowrap">
        <div className="text-2xl font-semibold leading-none">
          ${price.toFixed(0)}
        </div>
        <div className="flex items-end text-xs leading-5 text-muted-foreground">
          {isMonthly
            ? "USD per month"
            : isYearly
            ? "USD per month billed annually"
            : "forever"}
        </div>
      </div>
    </div>
  );
}
// Step 3: Project overview and creation component
function Step3({
  name,
  onCreate,
  loading,
  prevStep,
  selectedPlan,
  eventCount,
}: {
  name: string;
  onCreate: () => void;
  loading: boolean;
  prevStep: () => void;
  selectedPlan: string;
  eventCount: string;
}) {
  const selectedPlanDetails = plans.find(
    (plan) => plan.identifier === selectedPlan
  );

  return (
    <div className="flex flex-col gap-[5px] md:mt-5">
      <div className="text-xl font-medium">Overview</div>
      <div className="text-sm text-muted-foreground">
        Review your project details before creating it.
      </div>
      <div className="mt-5 flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Label>Project Name</Label>
          <div className="rounded-[12px] border font-medium bg-accent min-h-[45px] h-[45px] flex items-center px-6 text-sm">
            {name}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label>Selected Plan</Label>
          {selectedPlanDetails ? (
            <PricingCard
              eventclassName="bg-white"
              className="bg-accent py-5"
              sliderValue={eventCount}
              name={selectedPlanDetails.name}
              description={selectedPlanDetails.description}
              price={calculatePrice(
                selectedPlanDetails.price,
                selectedPlanDetails.identifier,
                getEventCount(getSliderValue(eventCount)),
                selectedPlanDetails.name === "Starter" ? "year" : "month"
              )}
              recurrence={
                selectedPlanDetails.name === "Starter" ? "forever" : "month"
              }
              target={selectedPlanDetails.target}
              list={selectedPlanDetails.list}
            />
          ) : (
            "No plan selected"
          )}
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
