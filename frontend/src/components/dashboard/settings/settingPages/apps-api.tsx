import React from "react";
import SettingCard from "../../components/settingCard";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  AtSignIcon,
  BellIcon,
  EyeOffIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  TextIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingAppsPage() {
  return (
    <div>
      <SettingCard
        title="API KEY"
        description="The key to access our API, keep it a secret."
        content={
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Radomize API key
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This will delete your current API key.
                </p>
              </div>
              <Button
                variant={"destructiveOutline"}
                className="rounded-[12px]"
                disabled
                size={"sm"}
              >
                Randomize
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
}
