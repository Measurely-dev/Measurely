import LogoSvg from "@/components/global/logoSvg";
import Link from "next/link";
import { Box, Settings, Users } from "react-feather";
import DashboardNavItem from "./navItem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NavbarItemChip from "./navbarItemChip";
import { Separator } from "@/components/ui/separator";
import { HomeIcon } from "lucide-react";
import SettingDialog from "../../settings/settingDialog";

export const navItem = [
  {
    name: "Overview",
    href: "/dashboard/",
    svg: <HomeIcon className="size-5" />,
  },
  {
    name: "Metrics",
    href: "/dashboard/metrics/",
    svg: <Box className="size-5" />,
  },
  {
    name: "Team",
    href: "/dashboard/team/",
    svg: <Users className="size-5" />,
  },
];
export default function DashboardNavbar() {
  return (
    <div className="flex h-screen flex-col py-[15px] pl-5">
      <Link href="/">
        <div className="flex size-[45px] min-h-[45px] min-w-[45px] items-center justify-center rounded-[12px] border border-input/75">
          <LogoSvg className="size-[30px]" />
        </div>
      </Link>
      <div className="flex h-full flex-col gap-[16px] pt-[30px]">
        {navItem.map((item, i) => {
          return (
            <DashboardNavItem name={item.name} href={item.href} key={i}>
              {item.svg}
            </DashboardNavItem>
          );
        })}
      </div>
      <div className="flex flex-col gap-[16px]">
        <NavbarItemChip />
        <Separator className="w-6 mx-auto" />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <SettingDialog>
              <TooltipTrigger>
                <div
                  className={`flex h-[40px] min-h-[40px] border-transparent bg-background hover:bg-accent/50 w-[45px] min-w-[45px] hover:text-primary text-secondary items-center justify-center rounded-[12px] border text-[20px]`}
                >
                  <Settings className="size-5" />
                </div>
              </TooltipTrigger>
            </SettingDialog>

            <TooltipContent
              side="right"
              sideOffset={8}
              className="rounded-[6px] border bg-accent p-1 px-2 text-xs font-medium text-primary"
            >
              Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
