import React from "react";
import SettingCard from "../../components/settingCard";
import { Code } from "react-feather";
import { Button } from "@/components/ui/button";
export default function SettingPaymentPage() {
  return (
    <>
      <div className="bg-accent rounded-[12px] w-full px-5 py-3 flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <div className="flex flex-row gap-3 items-center">
            <Code className="size-5" />
            <div className="text-md font-semibold">You're using free plan</div>
          </div>
          <div className="text-secondary text-sm">
            You can unlock limits by upgrading to the next plan.
          </div>
        </div>
        <Button className="rounded-[12px]"  variant={"default"}>
          View plan
        </Button>
      </div>
    </>
  );
}
