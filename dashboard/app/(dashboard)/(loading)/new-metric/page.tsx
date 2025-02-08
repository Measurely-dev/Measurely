"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Content from "@/components/page-content";
import SemiNavbar from "@/components/semi-navbar";
import { MetricType, UserRole } from "@/types";
import { useRouter } from "next/navigation";
import {
  Button as AriaButton,
  Group,
  Input as AriaInput,
  NumberField,
} from "react-aria-components";
import { useContext, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { ProjectsContext } from "@/dash-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Minus, Plus } from "lucide-react";
import { UnitCombobox } from "@/components/ui/unit-combobox";
import confetti from "canvas-confetti";
import { useCharacterLimit } from "@/utils";
import { Step, StepProgressBar, useStep } from "@/components/ui/step";

const forbidden = [
  "average",
  "average trend",
  "positive trend",
  "negative trend",
  "event count",
];
const metricTypeInfo = {
  [MetricType.Base]: {
    title: "Basic metric",
    description:
      "Single value metrics that track straightforward counts and totals. Used for recording individual measurements and simple tallies.",
    placeholder: "New users, Deleted projects, Suspended accounts",
  },
  [MetricType.Average]: {
    title: "Average Metric",
    description:
      "Calculates and tracks averages and trends of values over time. Used for analyzing patterns and measuring ongoing performance.",
    placeholder: "Session duration, Ratings, Load time",
  },
  [MetricType.Dual]: {
    title: "Dual metric",
    description:
      "Tracks pairs of opposing or complementary values. Used for measuring additions/removals, increases/decreases, or other metrics with two states.",
    placeholder: "Users, Transfers, Projects",
  },
  [MetricType.Stripe]: {
    title: "Stripe Metric",
    description:
      "Financial metrics pulled from Stripe integration. Used for tracking revenue, subscriptions, refunds and other monetary data.",
    placeholder: "Revenue, Earnings, Sales, Profit",
  },
};

const MetricInput = ({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  characterCount,
  limit,
}: any) => (
  <div className="relative">
    <Input
      id={id}
      className="peer h-11 rounded-[12px] pe-14"
      type="text"
      placeholder={placeholder}
      value={value}
      maxLength={maxLength}
      onChange={onChange}
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
);

const BaseValueInput = ({ value, onChange }: any) => (
  <NumberField
    defaultValue={0}
    className="h-11 w-full rounded-[12px]"
    minValue={-1000000000}
    maxValue={1000000000}
    value={value}
    onChange={onChange}
  >
    <div className="space-y-2">
      <Group className="relative inline-flex h-11 w-full items-center overflow-hidden whitespace-nowrap rounded-[12px] border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-input data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-input/80">
        <AriaButton
          slot="decrement"
          className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus className="size-4" strokeWidth={2} aria-hidden="true" />
        </AriaButton>
        <AriaInput className="w-full grow bg-background px-3 py-2 text-center tabular-nums text-foreground focus:outline-none" />
        <AriaButton
          slot="increment"
          className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
        </AriaButton>
      </Group>
    </div>
  </NumberField>
);

const DualMetricInputs = ({
  namingType,
  setNamingType,
  namePos,
  setNamePos,
  nameNeg,
  setNameNeg,
}: any) => (
  <>
    <Label className="flex flex-col gap-3">
      Variable names
      <Select
        defaultValue={"auto"}
        value={namingType}
        onValueChange={(e) => {
          setNamingType(e);
          if (e === "manual") {
            setNamePos("");
            setNameNeg("");
          } else {
            setNamePos("added");
            setNameNeg("removed");
          }
        }}
      >
        <SelectTrigger className="h-11 border">
          <SelectValue placeholder="Select a type of naming" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"auto"}>Automatic</SelectItem>
            <SelectItem value={"manual"}>Manual</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Label className="text-xs font-normal leading-tight text-muted-foreground">
        Customize the names for positive and negative values to match your
        specific use case and improve clarity.
      </Label>
    </Label>

    {namingType === "manual" && (
      <>
        <Separator className="my-2" />
        <div className="flex w-full flex-col gap-3">
          <Label>Positive variable name</Label>
          <Input
            placeholder="Account created, transfer sent"
            type="text"
            className="h-11 rounded-[12px]"
            value={namePos}
            onChange={(e) => setNamePos(e.target.value.trimStart())}
          />
        </div>
        <div className="flex w-full flex-col gap-3">
          <Label>Negative variable name</Label>
          <Input
            placeholder="Account deleted, transfer kept"
            type="text"
            className="h-11 rounded-[12px]"
            value={nameNeg}
            onChange={(e) => setNameNeg(e.target.value.trimStart())}
          />
        </div>
      </>
    )}
  </>
);

export default function NewMetric() {
  const [tab, setTab] = useState("metrics");
  const [value, setValue] = useState<MetricType>(MetricType.Base);
  const [formData, setFormData] = useState({
    name: "",
    baseValue: 0,
    namePos: "added",
    nameNeg: "removed",
    namingType: "auto",
    unit: "",
  });
  const router = useRouter();
  const { projects, activeProject } = useContext(ProjectsContext);
  const { step, nextStep, prevStep } = useStep(3);

  const metricTypes = [
    {
      label: "metrics",
      types: [
        {
          name: "Basic Metric",
          value: MetricType.Base,
          description: metricTypeInfo[MetricType.Base].description,
        },
        {
          name: "Dual Variables Metric",
          value: MetricType.Dual,
          description: metricTypeInfo[MetricType.Dual].description,
        },
        {
          name: "Average Metric",
          value: MetricType.Average,
          description: metricTypeInfo[MetricType.Average].description,
        },
      ],
    },
    {
      label: "integrations",
      types: [
        {
          name: "Stripe integration",
          value: MetricType.Stripe,
          description: metricTypeInfo[MetricType.Stripe].description,
        },
        {
          name: "Google Analytics integration",
          value: MetricType.Google,
          description:
            "Tracks both positive and negative variables, useful for monitoring traffic sources, bounce rates, and conversion metrics.",
        },
        {
          name: "AWS CloudWatch integration",
          value: MetricType.AWS,
          description:
            "Monitors cloud infrastructure performance metrics, ideal for tracking resource utilization and server health.",
        },
      ],
    },
  ];

  const isComingSoon = (type: MetricType) =>
    type === MetricType.Google || type === MetricType.AWS;

  useEffect(() => {
    if (
      projects[activeProject].user_role !== UserRole.Admin &&
      projects[activeProject].user_role !== UserRole.Owner
    ) {
      router.push("/");
    }
  }, [projects, activeProject, router]);

  useEffect(() => {
    if (
      [MetricType.Stripe, MetricType.Google, MetricType.AWS].includes(value)
    ) {
      setTab("integrations");
    } else {
      setTab("metrics");
    }
  }, [value]);

  const renderStep = () => {
    switch (value) {
      case MetricType.Base:
      case MetricType.Average:
      case MetricType.Dual:
      case MetricType.Stripe:
        return (
          <MetricConfigurationStep
            type={value}
            formData={formData}
            setFormData={setFormData}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      <div className="flex flex-col flex-grow">
        <SemiNavbar href="/" button="Dashboard" />
        <Content className="flex flex-grow pt-[150px] pb-10">
          <div className="mx-auto flex w-full max-w-[600px] flex-col px-4">
            <StepProgressBar step={step + 1} totalSteps={3} />
            {step === 0 && (
              <Step>
                <Step1
                  metricTypes={metricTypes}
                  value={value}
                  setValue={setValue}
                  tab={tab}
                  setTab={setTab}
                  isComingSoon={isComingSoon}
                  nextStep={nextStep}
                />
              </Step>
            )}
            {step === 1 && <Step>{renderStep()}</Step>}
            {step === 2 && (
              <Step>
                <Step3
                  formData={formData}
                  setFormData={setFormData}
                  value={value}
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

function Step1({
  metricTypes,
  value,
  setValue,
  tab,
  setTab,
  isComingSoon,
  nextStep,
}: any) {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col gap-[5px] md:mt-5">
        <div className="text-xl font-medium">Choose metric type </div>
        <div className="text-sm text-muted-foreground">
          Select the type of metric you want to create
        </div>
      </div>
      <Tabs
        value={tab}
        defaultValue="metrics"
        className="mt-5 flex flex-col gap-5 px-1 pb-1"
        onValueChange={setTab}
      >
        <TabsList className="mb-0 grid w-full grid-cols-2 rounded-[12px] border-0 font-sans font-medium">
          <TabsTrigger value="metrics" className="rounded-[10px]">
            Metrics
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-[10px]">
            Integrations
          </TabsTrigger>
        </TabsList>
        {metricTypes.map((metric: any, i: number) => (
          <TabsContent className="space-y-3" value={metric.label} key={i}>
            {metric.types.map((type: any, j: number) => (
              <Metric
                key={j}
                {...type}
                state={value}
                setState={setValue}
                comingSoon={isComingSoon(type.value)}
              />
            ))}
          </TabsContent>
        ))}
        <div className="flex w-full flex-row justify-between gap-2 max-md:flex-col">
          <Button
            className="w-fit rounded-[12px]"
            variant="secondary"
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>
          <Button className="w-fit rounded-[12px]" onClick={nextStep}>
            Next
          </Button>
        </div>
      </Tabs>
    </>
  );
}

function Step3({ formData, setFormData, value, prevStep }: any) {
  const [loading, setLoading] = useState(false);
  const { projects, setProjects, activeProject } = useContext(ProjectsContext);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    const { name, baseValue, namePos, nameNeg, unit } = formData;

    if (forbidden.includes(name.toLowerCase())) {
      toast.error(
        "The variable names you have chosen are used internally, please choose something else.",
      );
      setLoading(false);
      return;
    }

    const end = Date.now() + 1 * 1000;
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
      });
      requestAnimationFrame(frame);
    };

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/metric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name,
        project_id: projects[activeProject].id,
        base_value: baseValue,
        type: value,
        name_pos: namePos,
        name_neg: nameNeg,
        unit,
      }),
    });

    if (response.ok) {
      frame();
      const data = await response.json();
      setProjects(
        projects.map((v, i) =>
          i === activeProject
            ? { ...v, metrics: [...(v.metrics ?? []), data] }
            : v,
        ),
      );
      toast.success("Metric was successfully created");
      router.push(`/metrics/${name}`);
    } else {
      const text = await response.text();
      toast.error(text);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[5px] md:mt-5">
      <div className="text-xl font-medium">Choose metric unit</div>
      <div className="text-sm text-muted-foreground">
        Select the unit that will be used to measure your metric.
      </div>
      <div className="mt-5">
        <UnitCombobox
          type="lg"
          unit={formData.unit}
          onChange={(unit) => setFormData({ ...formData, unit })}
          customUnits={[]}
        />
      </div>
      <div className="mt-5 flex w-full flex-row justify-end gap-2 max-md:flex-col">
        <Button
          type="button"
          variant="secondary"
          className="w-fit rounded-[12px]"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="default"
          loading={loading}
          className="w-fit rounded-[12px]"
          onClick={handleSubmit}
        >
          Create
        </Button>
      </div>
    </div>
  );
}

function Metric({
  name,
  value,
  description,
  state,
  setState,
  comingSoon,
}: any) {
  return (
    <div
      className={`flex w-full select-none flex-col gap-1 rounded-xl border p-3 shadow-sm shadow-black/5 transition-all duration-150 ${
        comingSoon
          ? "cursor-not-allowed bg-accent"
          : state === value
            ? "cursor-pointer bg-accent/50 ring-2 ring-primary/75"
            : "cursor-pointer hover:bg-accent/50"
      }`}
      onClick={() => !comingSoon && setState(value)}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">{name}</div>
        {comingSoon && <div className="text-xs text-blue-500">coming soon</div>}
      </div>
      <div className="text-xs font-light text-muted-foreground">
        {description}
      </div>
    </div>
  );
}

function MetricConfigurationStep({
  type,
  formData,
  setFormData,
  prevStep,
  nextStep,
}: {
  type: MetricType;
  formData: any;
  setFormData: (data: any) => void;
  prevStep: () => void;
  nextStep: () => void;
}) {
  const maxLength = 30;
  const id = useId();

  const {
    value,
    characterCount,
    handleChange: handleCharacterLimitChange,
    maxLength: limit,
  } = useCharacterLimit({ maxLength, initialValue: formData.name });

  useEffect(() => {
    setFormData({ ...formData, name: value });
  }, [value]);

  const handleInputChange = (e: any) => {
    handleCharacterLimitChange(e);
  };

  const info = metricTypeInfo[type as keyof typeof metricTypeInfo];

  return (
    <div className="mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-[5px]">
        <div className="text-xl font-medium">{info.title}</div>
        <div className="text-sm text-muted-foreground">{info.description}</div>
        <div className="flex w-full flex-col gap-3">
          <div className="my-2 flex flex-col gap-4">
            <div className="min-w-[300px] space-y-2">
              <Label htmlFor={id}>Metric name</Label>
              <MetricInput
                id={id}
                value={value}
                onChange={handleInputChange}
                placeholder={info.placeholder}
                maxLength={maxLength}
                characterCount={characterCount}
                limit={limit}
              />
            </div>

            {type !== MetricType.Stripe && (
              <div className="flex w-full flex-col gap-3">
                <Label>Base value</Label>
                <BaseValueInput
                  value={formData.baseValue}
                  onChange={(val: number) =>
                    setFormData({ ...formData, baseValue: val })
                  }
                />
                <Label className="text-xs font-normal leading-tight text-muted-foreground">
                  Base value stands for the value of the metric before using
                  Measurely to measure the metric
                </Label>
              </div>
            )}

            {type === MetricType.Dual && (
              <DualMetricInputs
                namingType={formData.namingType}
                setNamingType={(val: string) =>
                  setFormData({ ...formData, namingType: val })
                }
                namePos={formData.namePos}
                setNamePos={(val: string) =>
                  setFormData({ ...formData, namePos: val })
                }
                nameNeg={formData.nameNeg}
                setNameNeg={(val: string) =>
                  setFormData({ ...formData, nameNeg: val })
                }
              />
            )}
          </div>
        </div>

        <div className="mt-5 flex w-full flex-row justify-end gap-2 max-md:flex-col">
          <Button
            type="button"
            variant="secondary"
            className="w-fit rounded-[12px]"
            onClick={prevStep}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="default"
            className="w-fit rounded-[12px]"
            onClick={nextStep}
            disabled={
              !formData.name ||
              (type === MetricType.Dual &&
                formData.namingType === "manual" &&
                (!formData.namePos || !formData.nameNeg))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
