// Import required UI components and React types
import { getEventAmount } from "@/utils";
import { Slider } from "./ui/slider";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Dispatch, SetStateAction } from "react";
import { Badge } from "./ui/badge";

// Interface defining props for the PricingOptions component
interface PricingOptionsProps {
  sliderValue: number[]; // Current value of slider
  setSliderValue: (value: number[]) => void; // Function to update slider value
  billingPeriod: "month" | "year"; // Current billing period selection
  setBillingPeriod: Dispatch<SetStateAction<"month" | "year">>; // Function to update billing period
  type?: "page" | "dialog"; // Display type of the component
}

// Component for displaying and managing pricing options
export const PricingOptions = ({
  sliderValue,
  setSliderValue,
  billingPeriod,
  setBillingPeriod,
  type = "page",
}: PricingOptionsProps) => {
  return (
    <div
      className={
        type !== "page"
          ? "mb-4 flex flex-row items-end justify-between gap-2 px-1"
          : "flex flex-col-reverse"
      }
    >
      {/* Event quantity slider section */}
      <div
        className={`flex w-full max-w-[400px] flex-row items-center gap-4 max-md:w-[85%] ${type === "dialog" ? "mt-10" : "mx-auto mb-10 mt-[40px]"}`}
      >
        <span className="font-mono text-sm font-medium text-primary">10K</span>
        <Slider
          defaultValue={[0]}
          max={100}
          step={10}
          value={sliderValue}
          onValueChange={(e) => setSliderValue(e)}
          formatLabel={(value) => `Up to ${getEventAmount(value)} events`}
        />
        <span className="font-mono text-sm font-medium text-primary">10M+</span>
      </div>

      {/* Billing period toggle section */}
      <ToggleGroup
        type="single"
        variant="default"
        className={
          type === "dialog"
            ? "w-fit rounded-[12px] bg-accent p-1"
            : "mx-auto my-[30px] w-fit rounded-[12px] bg-accent p-1"
        }
        onValueChange={(value) => {
          if (value !== billingPeriod) {
            setBillingPeriod(value === "year" ? "year" : "month");
          }
        }}
        value={billingPeriod}
      >
        <ToggleGroupItem
          value="month"
          className="rounded-[10px] data-[state=on]:!bg-background"
        >
          Monthly
        </ToggleGroupItem>
        <ToggleGroupItem
          value="year"
          className="flex items-center rounded-[10px] data-[state=on]:!bg-background"
        >
          Yearly
          <Badge className="pointer-events-none rounded-[8px] border bg-background shadow-none">
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent">
              -20%
            </div>
          </Badge>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
