import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Book,
  Code,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  User,
} from "react-feather";
import FeedbackPopover from "../../components/feedbackPopover";

import AvatarDropdown from "./dropdown";
import ApplicationsChip from "./application";
import Link from "next/link";
import { ReactNode, useContext } from "react";
import { UserContext } from "@/dashContext";
import ApiDialog from "../../components/apiDialog";
import { Separator } from "@/components/ui/separator";
import { HomeIcon } from "lucide-react";
import { navItem } from "../navbar/navbar";
import { DialogClose } from "@/components/ui/dialog";
import { usePathname } from "next/navigation";
import { GearIcon } from "@radix-ui/react-icons";
import SettingDialog from "../../settings/settingDialog";
import { useRouter } from "next/navigation";
export const DrawerMenu = (props: { image: any; children: ReactNode }) => {
  const pathname = usePathname();
  const { user } = useContext(UserContext);
  const router = useRouter()
  function Capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <Drawer>
      <DrawerTrigger className="md:hidden">{props.children}</DrawerTrigger>
      <DrawerContent className="flex flex-col gap-2 max-sm:p-2 !pt-0 p-10">
        <Label className="flex flex-row gap-4 items-center p-2 rounded-[12px]">
          <Avatar className="size-[35px] cursor-pointer border text-secondary hover:text-primary">
            <AvatarImage src={props.image} className="rounded-full" />
            <AvatarFallback>
              <User className="size-1/2" />
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-1">
            <div>{Capitalize(user?.firstname ?? "Unknown")}</div>
            {Capitalize(user?.lastname ?? "")}
          </div>
        </Label>
        <Separator className="my-2" orientation="horizontal" />

        {navItem?.map((item, i) => {
          return (
            <DialogClose asChild>
              <Link href={item.href}>
                <Button
                  key={i}
                  variant={"ghost"}
                  className={`${pathname === item.href ? "bg-accent" : ""} rounded-[12px] justify-start gap-1.5 w-full`}
                >
                  {item.svg}
                  {item.name}
                </Button>
              </Link>
            </DialogClose>
          );
        })}

        <Separator className="my-2" orientation="horizontal" />
        <Link href={"/dashboard/new-metric"}>
          <Button className="h-[35px] gap-[8px] rounded-[12px] w-full">
            <Plus className="size-[16px]" />
            Create metric
          </Button>
        </Link>
        <div className="sm:hidden">
          <ApiDialog>
            <Button
              variant={"secondary"}
              className="rounded-[12px] gap-1.5 w-full"
            >
              <Code className="size-4" />
              Api key
            </Button>
          </ApiDialog>
        </div>
        <Button
          className="h-[35px] gap-[8px] rounded-[12px] text-secondary hover:text-primary"
          variant="secondary"
        >
          <Book className="size-[16px]" />
          Documentation
        </Button>
        <SettingDialog>
          <Button
            className="h-[35px] gap-[8px] rounded-[12px] text-secondary hover:text-primary"
            variant="secondary"
          >
            <Settings className="size-[16px]" />
            Settings
          </Button>
        </SettingDialog>
        <Button
          className="h-[35px] gap-[8px] !bg-red-500/5 rounded-[12px] bg-red-500/0 hover:!bg-red-500/20 transition-all !text-red-500"
          variant="default"
          onClick={() => {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/logout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }).then(() => {
              router.push("/sign-in");
            });
          }}
        >
          <LogOut className="size-[16px]" />
          Logout
        </Button>
      </DrawerContent>
    </Drawer>
  );
};
