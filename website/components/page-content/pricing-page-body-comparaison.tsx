"use client";

// Import required UI components and icons
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, XIcon } from "lucide-react";
import HeroTitle from "../hero-title";
import { useRouter } from "next/navigation";

// Component for displaying pricing plan comparison
export default function PricingBodyComparaison() {
  const router = useRouter();
  // Define pricing plans data structure with features and options
  const pricingSection = [
    {
      label: "Starter",
      mainFeatures: [
        { value: 1, label: "Team Members" },
        { value: 3, label: "Metrics" },
        { value: 1, label: "Filter Categories per metric" },
        { value: 6, label: "Filters per filter category" },
        { value: 3, label: "Blocks Limit" },
        { value: "Up to 5K", label: "Events (per month)" },
      ],
      features: [
        { label: "Chart Customizations", state: true },
        { label: "Block Support", state: true },
        { label: "Year Overview", state: false },
      ],
      support: { label: "Priority support", state: false },
      action: {
        label: "Get started",
        onclick: () => {
          router.push("https://app.measurely.dev/waitlist");
        },
      },
    },
    {
      label: "Plus",
      mainFeatures: [
        { value: 5, label: "Team Members" },
        { value: 10, label: "Metrics" },
        { value: 20, label: "Filter Categories per metric" },
        { value: 3, label: "Filters per filter category" },
        { value: 5, label: "Blocks Limit" },
        { value: "Up to 10M", label: "Events (per month)" },
      ],
      features: [
        { label: "Chart Customizations", state: true },
        { label: "Block Support", state: true },
        { label: "Year Overview", state: true },
      ],
      support: { label: "Priority support", state: true },
      action: {
        label: "Get Plus",
        onclick: () => {
          router.push("https://app.measurely.dev/waitlist");
        },
      },
    },
    {
      label: "Pro",
      mainFeatures: [
        { value: 20, label: "Team Members" },
        { value: 30, label: "Metrics" },
        { value: 4, label: "Filter Categories per metric" },
        { value: 3, label: "Filters per filter category" },
        { value: 20, label: "Blocks Limit" },
        { value: "Up to 10M", label: "Events (per month)" },
      ],
      features: [
        { label: "Chart Customizations", state: true },
        { label: "Block Support", state: true },
        { label: "Year Overview", state: true },
      ],
      support: { label: "Priority support", state: true },
      action: {
        label: "Get Pro",
        onclick: () => {
          router.push("https://app.measurely.dev/waitlist");
        },
      },
    },
  ];

  return (
    <>
      {/* Hero section with title */}
      <HeroTitle
        className="mt-32"
        subtitle="Plans"
        title="Find the Right Plan for You"
      />

      {/* Grid container for pricing cards */}
      <div className="mt-10 grid grid-cols-3 max-lg:grid-cols-1">
        {pricingSection.map((plan, index) => (
          // Individual pricing card container
          <div
            key={index}
            className={`flex flex-col rounded-[16px] gap-4 border-y border-y-transparent py-4 md:py-7 ${plan.label === "Plus" && "md:border md:!border-input md:shadow-md"}`}
          >
            {/* Plan name header */}
            <div className="px-7 pb-2 text-3xl font-medium">{plan.label}</div>
            <Separator />
            {/* Main features section */}
            {plan.mainFeatures.map((feature, idx) => (
              <div key={`main-feature-${idx}`} className="flex gap-4 flex-col">
                <div className="flex items-center gap-1 px-7 text-sm">
                  <div className="font-semibold">{feature.value}</div>
                  <div>{feature.label}</div>
                </div>
                <Separator />
              </div>
            ))}

            {/* Additional features section */}
            <div
              className={`px-7 py-1 text-2xl font-medium ${plan.label !== "Starter" && "lg:text-transparent"}`}
            >
              Features
            </div>
            <Separator />

            {/* Feature list with checkmark indicators */}
            {plan.features.map((feature, idx) => (
              <div key={`feature-${idx}`} className="flex flex-col gap-4">
                <div className="flex items-center gap-1 px-7 text-sm">
                  <div
                    className={`mr-1 flex size-5 items-center justify-center rounded-[6px] bg-accent ${feature.state ? "bg-blue-100 text-blue-600 dark:bg-blue-300 dark:text-blue-900" : ""}`}
                  >
                    {feature.state ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      <XIcon className="size-3" />
                    )}
                  </div>
                  {feature.label}
                </div>
                <Separator />
              </div>
            ))}

            {/* Support section */}
            <div
              className={`px-7 py-1 text-2xl font-medium ${plan.label !== "Starter" && "lg:text-transparent"}`}
            >
              Support
            </div>
            <Separator />
            <div className="flex items-center gap-1 px-7 text-sm">
              <div
                className={`mr-1 flex size-5 items-center justify-center rounded-[6px] bg-accent ${plan.support.state ? "bg-blue-100 text-blue-600 dark:bg-blue-300 dark:text-blue-900" : ""}`}
              >
                {plan.support.state ? (
                  <CheckIcon className="size-3" />
                ) : (
                  <XIcon className="size-3" />
                )}
              </div>
              {plan.support.label}
            </div>
            <Separator />

            {/* Action button */}
            <Button
              variant={plan.label === "Plus" ? "default" : "outline"}
              className="mx-auto w-[calc(100%-56px)] rounded-[12px]"
              onClick={plan.action.onclick}
            >
              {plan.action.label}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
