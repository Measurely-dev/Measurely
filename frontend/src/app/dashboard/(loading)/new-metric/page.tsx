"use client";
import ErrorMsg from "@/components/dashboard/components/error";
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
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import Footer from "@/components/website/layout/footer/footer";
import { AppsContext } from "@/dashContext";
import { GroupType } from "@/types";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

export default function NewMetric() {
  const [step, setStep] = useState(1);
  const [value, setValue] = useState<number>(0);

  const metricTypes = [
    {
      name: "Basic metric",
      value: GroupType.Base,
      description:
        "Tracks a single, always-positive variable, perfect for monitoring growth, like total active users or daily logins.",
    },
    {
      name: "Dual Variable Metric",
      value: GroupType.Dual,
      description:
        "This metric compares two opposing variables, allowing you to track both positive and negative influences on a key metric. For example, monitor user activity by measuring new account creations versus deletions, giving you a clear view of net growth or decline.",
    },
    {
      name: "Multi-metric (Coming soon)",
      value: 2,
      description:
        "Combines multiple variables to give a complete overview, ideal for tracking complex interactions like user engagement across various activities.",
    },
  ];

  const renderStep = () => {
    switch (value) {
      case GroupType.Base:
        return <BasicStep setStep={setStep} />;
      case GroupType.Dual:
        return <DualStep setStep={setStep} />;
    }
  };

  return (
    <div className="flex flex-col">
      <WebContainer className="h-[100vh] w-[100vw]">
        <AuthNavbar href="/dashboard" button="Dashboard" />
        <ContentContainer className="flex h-full items-center justify-center">
          {step === 1 ? (
            <>
              <div className="mx-auto flex w-[500px] flex-col gap-6">
                <div className="flex flex-col gap-[5px]">
                  <div className="text-xl font-medium">Choose metric type </div>
                  <div className="text-sm text-secondary">
                    We&apos;ll fill the billing details automatically if we find
                    the company.
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {metricTypes.map((metric, i) => {
                    return (
                      <Metric
                        descripiton={metric.description}
                        name={metric.name}
                        key={i}
                        value={metric.value}
                        state={value}
                        setState={setValue}
                      />
                    );
                  })}
                </div>
                {/* Next btn */}
                <Button
                  className="w-full rounded-[12px]"
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="w-[500px] h-fit">{renderStep()}</div>
          )}
        </ContentContainer>
      </WebContainer>
      <Footer border bg="secondary" type="default" />
    </div>
  );
}

function Metric(props: {
  name: string;
  value: number;
  descripiton: string;
  state: any;
  setState: (props: number) => void;
}) {
  return (
    <div
      className={`w-full rounded-xl border p-3 gap-1 flex flex-col select-none transition-all duration-150 
      ${props.value === 2 ? "cursor-not-allowed !bg-accent" : ""}
       ${
         props.state === props.value
           ? "ring-2 ring-blue-500 bg-blue-500/5 cursor-pointer"
           : "hover:bg-accent/50 cursor-pointer"
       }`}
      onClick={() => {
        if (props.value === 2) {
          return;
        }
        props.setState(props.value);
      }}
    >
      <div className="text-sm font-medium">{props.name}</div>
      <div className="text-secondary text-xs font-light">
        {props.descripiton}
      </div>
    </div>
  );
}

function BasicStep(props: { setStep: (props: number) => void }) {
  const [baseValue, setBaseValue] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { applications, setApplications, activeApp } = useContext(AppsContext);
  const router = useRouter();

  return (
    <div className="mx-auto flex w-[500px] flex-col gap-6">
      <div className="flex flex-col gap-[5px]">
        <div className="text-xl font-medium">Basic metric</div>
        <div className="text-sm text-secondary">
          We&apos;ll fill the billing details automatically if we find the
          company.
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-col gap-4 my-2">
            <div className="flex w-full flex-col gap-3">
              <Label>Metric name</Label>
              <Input
                placeholder="New users, Deleted projects, Suspended accounts"
                type="email"
                className="h-11 rounded-[12px]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-3">
              <Label>Base value</Label>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="optional"
                  type="number"
                  value={baseValue}
                  onChange={(e) => setBaseValue(Number(e.target.value))}
                  className="h-11 rounded-[12px]"
                />
                <Label className="text-xs font-normal text-secondary leading-tight">
                  Base value stands for the value of the metric before using
                  measurely to measure the metric
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-2 w-full">
          <Button
            type="button"
            variant="secondary"
            className="rounded-[12px] w-full"
            onClick={() => props.setStep(1)}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="default"
            loading={loading}
            disabled={name === "" || loading}
            className="rounded-[12px] w-full"
            onClick={() => {
              setLoading(true);
              setError("");
              if (name === "") {
                setError("Name cannot be empty");
                return;
              }

              fetch(process.env.NEXT_PUBLIC_API_URL + "/metric", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  name: name,
                  basevalue: baseValue,
                  type: GroupType.Base,
                  appid: applications?.[activeApp].id,
                  metrics: ["default"],
                }),
              })
                .then((res) => {
                  if (!res.ok) {
                    res.text().then((text) => {
                      setError(text);
                    });
                  } else {
                    return res.json();
                  }
                })
                .then((json) => {
                  if (
                    json === null ||
                    applications?.[activeApp].groups === null ||
                    applications === null
                  ) {
                    return;
                  }

                  setApplications(
                    applications?.map((v, i) =>
                      i === activeApp
                        ? Object.assign({}, v, {
                            groups: [
                              ...(applications[activeApp].groups ?? []),
                              json,
                            ],
                          })
                        : v
                    )
                  );

                  router.push("/dashboard/metrics");
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            Create
          </Button>
        </div>

        <ErrorMsg error={error} />
      </div>
    </div>
  );
}

function DualStep(props: { setStep: (props: number) => void }) {
  const [name, setName] = useState("");
  const [namePos, setNamePos] = useState("added");
  const [nameNeg, setNameNeg] = useState("removed");
  const [namingType, setNamingType] = useState("auto");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { applications, setApplications, activeApp } = useContext(AppsContext);
  const router = useRouter();

  return (
    <div className="mx-auto flex w-[500px] flex-col gap-6">
      <div className="flex flex-col gap-[5px]">
        <div className="text-xl font-medium">Dual metric</div>
        <div className="text-sm text-secondary">
          We&apos;ll fill the billing details automatically if we find the
          company.
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-col gap-4 my-2">
            <div className="flex w-full flex-col gap-3">
              <Label>Metric name</Label>
              <Input
                placeholder="Accounts, Transfers"
                type="email"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-[12px]"
              />
            </div>

            <Label className="flex flex-col gap-3">
              Varibale naming
              <Select
                defaultValue={"auto"}
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
                <SelectTrigger className="border h-11">
                  <SelectValue placeholder="Select a type of naming" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={"auto"}>Automatic</SelectItem>
                    <SelectItem value={"manual"}>Manual</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
            {namingType === "auto" ? (
              <></>
            ) : (
              <>
                <Separator className="my-2" />
                <div className="flex w-full flex-col gap-3">
                  <Label>Positive variable name</Label>
                  <Input
                    placeholder="Account created, transfer sent"
                    type="email"
                    className="h-11 rounded-[12px]"
                    value={namePos}
                    onChange={(e) => {
                      setNamePos(e.target.value);
                    }}
                  />
                </div>

                <div className="flex w-full flex-col gap-3">
                  <Label>Negative variable name</Label>
                  <Input
                    placeholder="Account deleted, transfer kept"
                    type="email"
                    className="h-11 rounded-[12px]"
                    value={nameNeg}
                    onChange={(e) => {
                      setNameNeg(e.target.value);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-2 w-full">
          <Button
            type="button"
            variant="secondary"
            className="rounded-[12px] w-full"
            onClick={() => props.setStep(1)}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="default"
            loading={loading}
            disabled={
              loading || name === "" || namePos === "" || nameNeg === ""
            }
            className="rounded-[12px] w-full"
            onClick={() => {
              setLoading(true);
              setError("");
              if (name === "") {
                setError("Name cannot be empty");
                return;
              }

              fetch(process.env.NEXT_PUBLIC_API_URL + "/metric", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  name: name,
                  basevalue: 0,
                  type: GroupType.Dual,
                  appid: applications?.[activeApp].id,
                  metrics: [namePos, nameNeg],
                }),
              })
                .then((res) => {
                  if (!res.ok) {
                    res.text().then((text) => {
                      setError(text);
                    });
                  } else {
                    return res.json();
                  }
                })
                .then((json) => {
                  if (
                    json === null ||
                    applications?.[activeApp].groups === null ||
                    applications === null
                  ) {
                    return;
                  }

                  setApplications(
                    applications?.map((v, i) =>
                      i === activeApp
                        ? Object.assign({}, v, {
                            groups: [
                              ...(applications[activeApp].groups ?? []),
                              json,
                            ],
                          })
                        : v
                    )
                  );

                  router.push("/dashboard/metrics");
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            Create
          </Button>
        </div>

      <ErrorMsg error={error}/>
      </div>
    </div>
  );
}
