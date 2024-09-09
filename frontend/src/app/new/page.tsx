"use client";
import { Button } from "@/components/ui/button";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import Footer from "@/components/website/layout/footer/footer";
import { useState } from "react";

export default function NewTeam() {
  const [step, setStep] = useState(1);
  const [value, setValue] = useState<string>("");

  const metricTypes = [
    {
      name: "Basic metric",
      value: "basic",
      description:
        "Tracks a single, always-positive variable, perfect for monitoring growth, like total active users or daily logins.",
    },
    {
      name: "Dual Variable Metric",
      value: "dual",
      description:
        "This metric compares two opposing variables, allowing you to track both positive and negative influences on a key metric. For example, monitor user activity by measuring new account creations versus deletions, giving you a clear view of net growth or decline.",
    },
    {
      name: "Multi-metric (Coming soon)",
      value: "multi",
      description:
        "Combines multiple variables to give a complete overview, ideal for tracking complex interactions like user engagement across various activities.",
    },
  ];
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
                  disabled={value === "" ? true : false}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <></>
          )}
        </ContentContainer>
      </WebContainer>
      <Footer border bg="secondary" type="default" />
    </div>
  );
}

function Metric(props: {
  name: string;
  value: string;
  descripiton: string;
  state: any;
  setState: (props: string) => void;
}) {
  return (
    <div
      className={`w-full rounded-xl border p-3 gap-1 flex flex-col select-none transition-all duration-150 
      ${props.value === "multi" ? "cursor-not-allowed !bg-accent" : ""}
       ${
         props.state === props.value
           ? "ring-2 ring-blue-500 bg-blue-500/5 cursor-pointer"
           : "hover:bg-accent/50 cursor-pointer"
       }`}
      onClick={() => {
        props.value === "multi"
          ? {}
          : props.value === props.state
          ? props.setState('')
          : props.setState(props.value);
      }}
    >
      <div className="text-sm font-medium">{props.name}</div>
      <div className="text-secondary text-xs font-light">
        {props.descripiton}
      </div>
    </div>
  );
}
