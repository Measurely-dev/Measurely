"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import PricingCard from "@/components/global/pricing-card";
import { plans } from "@/plans";
import { useConfirm } from "@omit/react-confirm-dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ArrowBigDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useState } from "react";
import { toast } from "sonner";
import { PricingOptions } from "./global/pricing-options";
import { calculatePrice, getEventAmount, getEventCount } from "@/utils";
import { ProjectsContext } from "@/dash-context";

// PlansDialog component handles the subscription plan selection and management
export default function PlansDialog(props: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const confirm = useConfirm();
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");
  const { projects, activeProject } = useContext(ProjectsContext);

  // Handles the subscription process for a selected plan
  const subscribe = async (plan: string) => {
    setLoading(true);

    let isConfirmed = true;

    // Show confirmation dialog for downgrading to starter plan
    if (plan === "starter") {
      isConfirmed = await confirm({
        title: "Downgrade Plan",
        icon: (
          <ArrowBigDown className="size-6 fill-destructive text-destructive" />
        ),
        description: "Are you sure you want to downgrade to the starter plan?",
        confirmText: "Yes, Downgrade",
        cancelText: "Cancel",
        cancelButton: {
          size: "default",
          variant: "outline",
        },
        confirmButton: {
          className: "bg-red-500 hover:bg-red-600 text-white",
        },
        alertDialogTitle: {
          className: "flex items-center gap-1",
        },
      });
    }

    if (isConfirmed) {
      const events = getEventCount(sliderValue[0]);

      // Make API call to subscribe to selected plan
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribe`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan,
          max_events: events,
          project_id: projects[activeProject].id,
          subscription_type: billingPeriod === "year" ? 1 : 0,
        }),
      })
        .then((resp) => {
          if (resp.status === 200) {
            if (plan === "starter") {
              toast.success("Successfully downgraded to the starter plan");
              window.location.reload();
            } else {
              return resp.json();
            }
          } else if (resp.status === 304) {
            toast.warning("You are already on this plan");
            setLoading(false);
          } else {
            resp.text().then((text) => {
              toast.error(text);
            });
            setLoading(false);
          }
        })
        .then((data) => {
          if (data !== null && data !== undefined) {
            toast.success("Opening checkout session...");
            setTimeout(() => router.push(data.url), 500);
          }
        });
    } else {
      setLoading(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(e) => {
        if (!e) {
          setSliderValue([0]);
          setBillingPeriod("month");
        }
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="max-h-[95%] w-[95%] !max-w-[1100px] overflow-y-scroll rounded-sm shadow-sm max-lg:min-w-[95%]">
        <DialogHeader className="!m-0 flex flex-row items-center justify-between !p-0">
          <DialogTitle className="text-2xl">Plans</DialogTitle>
          <DialogClose className="!m-0 h-full !p-0" asChild>
            <Button
              type="button"
              size={"icon"}
              variant="secondary"
              className="rounded-[12px]"
            >
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <PricingOptions
          billingPeriod={billingPeriod}
          setBillingPeriod={setBillingPeriod}
          setSliderValue={setSliderValue}
          sliderValue={sliderValue}
          type="dialog"
        />
        <div className="grid grid-cols-3 gap-5 overflow-y-scroll max-lg:gap-1 max-md:grid-cols-1 max-md:gap-5">
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
                loading={loading}
                disabled={loading}
                onSelect={() => {
                  subscribe(plan.identifier);
                }}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
