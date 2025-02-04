"use client";

import { plans } from "@/plans";
import PageHeader from "../page-header";
import PricingCard from "@/components/global/pricing-card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PricingOptions } from "../pricing-options";
import { calculatePrice, getEventAmount, getEventCount } from "@/utils";

export default function PricingBody() {
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const optionType = windowWidth && windowWidth > 768 ? "dialog" : "page";

  return (
    <>
      <PageHeader
        title="Pricing that grows with your project"
        description="Use Measurely for free to track your metrics. Upgrade to unlock more features and insights."
        className="mx-auto mb-10 max-w-[750px]"
        descriptionClassName="max-w-[600px]"
      />
      <PricingOptions
        billingPeriod={billingPeriod}
        setBillingPeriod={setBillingPeriod}
        setSliderValue={setSliderValue}
        sliderValue={sliderValue}
        type={optionType}
      />
      <div
        className={`grid grid-cols-3 max-lg:grid-cols-1 max-lg:gap-[10px] ${
          windowWidth && windowWidth > 768 ? "mt-10" : ""
        }`}
      >
        {plans.map((plan, i) => {
          const price = calculatePrice(
            plan.price,
            plan.identifier,
            getEventCount(sliderValue[0]),
            billingPeriod,
          );
          return (
            <PricingCard
              key={i}
              className={`lg:first:rounded-e-none lg:first:border-r-0 lg:last:rounded-s-none lg:last:border-l-0 ${
                plan.name === "Plus"
                  ? "lg:z-10 lg:scale-105 lg:bg-background lg:shadow-xl"
                  : ""
              }`}
              sliderValue={getEventAmount(sliderValue[0])}
              name={plan.name}
              description={plan.description}
              price={price}
              recurrence={plan.name === "Starter" ? "forever" : billingPeriod}
              target={plan.target}
              list={plan.list}
              button={
                plan.identifier === "starter"
                  ? "Get started"
                  : "Continue with " + plan.name
              }
              onSelect={() => {
                router.push("https://app.measurely.dev/waitlist");
              }}
            />
          );
        })}
      </div>
      <div className="mx-auto mt-10 text-xs text-muted-foreground">
        * All prices are in USD
      </div>
    </>
  );
}
