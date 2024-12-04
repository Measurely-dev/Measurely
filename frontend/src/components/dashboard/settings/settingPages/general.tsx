import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import SettingCard from "../../components/settingCard";
import { Label } from "@/components/ui/label";

export default function SettingGeneralPage() {
  return (
    <div className="grid gap-6">
      <SettingCard
        title="Profile"
        description="Used to identify your account."
        content={
          <form className="flex flex-col gap-4">
            <Label className="flex flex-col gap-2">
              Username
              <Input placeholder="Username" defaultValue="username" />
            </Label>
            <Label className="flex flex-col gap-2">
              Email
              <Input placeholder="Email" defaultValue="name@domain.com" />
            </Label>
            <Button variant={"secondary"} className="rounded-[12px] w-fit">
              Change pasword
            </Button>
          </form>
        }
        btn="Save"
      />

      <SettingCard
        title="Notification"
        description="Choose what you want to be notified about"
        content={
          <div className="gap-2 flex flex-col">
            <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50">
              <BellIcon className="mt-px h-5 w-5" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Everything</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email digest, mentions & all activity.
                </p>
              </div>
            </div>
            <div className="-mx-2 flex items-start space-x-4 rounded-md bg-gray-100 p-2 text-gray-900 transition-all dark:bg-gray-800 dark:text-gray-50">
              <AtSignIcon className="mt-px h-5 w-5" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Only mentions and comments.
                </p>
              </div>
            </div>
            <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50">
              <EyeOffIcon className="mt-px h-5 w-5" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Ignoring</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Turn off all notifications.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <SettingCard
        title="Apparence"
        description="Choose your preferred theme and font size."
        content={
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose between light and dark mode.
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SunIcon className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value="light">
                    <DropdownMenuRadioItem value="light">
                      <SunIcon className="h-4 w-4 mr-2" />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <MoonIcon className="h-4 w-4 mr-2" />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <MonitorIcon className="h-4 w-4 mr-2" />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Font Size</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Adjust the font size to your preference.
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <TextIcon className="h-4 w-4 mr-2" />
                    Medium
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value="medium">
                    <DropdownMenuRadioItem value="small">
                      Small
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="medium">
                      Medium
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="large">
                      Large
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        }
      />

      <SettingCard
        title="Privacy"
        description="Manage your privacy settings."
        content={
          <div className="gap-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Share Usage Data
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Help us improve the product by sharing anonymous usage data.
                </p>
              </div>
              <Switch id="share-usage-data" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Allow Third-Party Cookies
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable third-party cookies for personalized content.
                </p>
              </div>
              <Switch id="third-party-cookies" />
            </div>
          </div>
        }
      />
    </div>
  );
}
