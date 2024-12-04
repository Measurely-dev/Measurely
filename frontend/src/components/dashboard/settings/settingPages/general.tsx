import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtSignIcon, BellIcon, EyeOffIcon } from "lucide-react";
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
            <div className="-mx-2 flex items-start space-x-4 rounded-[12px] p-4 select-none transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50">
              <BellIcon className="mt-px h-5 w-5" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Everything</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email digest, mentions & all activity.
                </p>
              </div>
            </div>
            <div className="-mx-2 flex items-start space-x-4 rounded-[12px] p-4 select-none bg-gray-100 p-2 text-gray-900 transition-all dark:bg-gray-800 dark:text-gray-50">
              <AtSignIcon className="mt-px h-5 w-5" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Only mentions and comments.
                </p>
              </div>
            </div>
            <div className="-mx-2 flex items-start space-x-4 rounded-[12px] p-4 select-none p-2 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50">
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
        title="Providers"
        description="A list of providers connected with thsi account."
        content={
          <div className="gap-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex flex-row gap-2 items-center">
                <div className="size-10 rounded-[6px] flex items-center justify-center bg-accent">
                  <svg
                    className="size-6"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {" "}
                    <path
                      fill="#000"
                      d="M16 2C8.27 2 2 8.268 2 16c0 6.186 4.011 11.433 9.575 13.285.699.13.925-.305.925-.673v-2.607c-3.894.847-4.705-1.652-4.705-1.652-.637-1.618-1.555-2.048-1.555-2.048-1.27-.87.096-.85.096-.85 1.406.097 2.146 1.442 2.146 1.442 1.248 2.14 3.275 1.522 4.074 1.164.125-.905.488-1.523.889-1.872-3.11-.356-6.378-1.556-6.378-6.92 0-1.529.547-2.777 1.442-3.757-.145-.354-.624-1.778.136-3.706 0 0 1.176-.375 3.851 1.436A13.427 13.427 0 0 1 16 8.77c1.19.006 2.388.161 3.507.472 2.673-1.811 3.846-1.436 3.846-1.436.762 1.929.283 3.353.138 3.706.899.98 1.441 2.23 1.441 3.758 0 5.377-3.275 6.561-6.392 6.907.502.434.96 1.286.96 2.593v3.842c0 .372.224.81.934.672C25.994 27.43 30 22.184 30 16c0-7.732-6.268-14-14-14Z"
                    ></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">Github</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    GitHub: platform for code hosting.
                  </p>
                </div>
              </div>
              <Button
                variant={"ghost"}
                size={"sm"}
                className="rounded-[12px]"
              >
                Disconnect
              </Button>
            </div>
          </div>
        }
      />

      <SettingCard
        title="Danger zone"
        danger
        description="Be careful, each action could be dangerous."
        content={
          <div className="gap-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Delete account
                </p>
                <p className="text-sm text-red-500 dark:text-red-400">
                  This action will delete this account forever.
                </p>
              </div>
              <Button
                variant={"destructiveOutline"}
                size={"sm"}
                className="rounded-[12px]"
              >
                Delete account
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
}
