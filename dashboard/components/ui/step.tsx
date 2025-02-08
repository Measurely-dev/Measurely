import { useState } from "react";

export const Step = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full">{children}</div>
);

export const useStep = (maxSteps: number) => {
  const [step, setStep] = useState(0);
  return {
    step,
    nextStep: () => step < maxSteps - 1 && setStep(step + 1),
    prevStep: () => step > 0 && setStep(step - 1),
    setStep,
  };
};

export const StepProgressBar = ({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) => (
  <div className="w-full bg-accent rounded-[4px] h-2 mb-6">
    <div
      className="bg-primary h-2 rounded-[4px] transition-all duration-300 ease-in-out"
      style={{ width: `${(step / totalSteps) * 100}%` }}
    />
  </div>
);
