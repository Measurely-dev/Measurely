"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Home, Key, Stars, User, X } from "lucide-react";
import { ReactNode, useState } from "react";
import SettingGeneralPage from "./settingPages/general";
import { Hexagon } from "react-feather";
import { Button } from "@/components/ui/button";
import SettingAppsPage from "./settingPages/apps-api";
import SettingPaymentPage from "./settingPages/payment";

export default function SettingDialog(props: { children: ReactNode }) {
  const [page, setPage] = useState("general");
  const settings = [
    {
      name: "General",
      icon: <Home className="size-4 text-blue-500" />,
      value: "general",
    },
    {
      name: "Applications",
      icon: <Hexagon className="size-4 text-blue-500" />,
      value: "applications",
    },
    {
      name: "Payment",
      icon: <CreditCard className="size-4 text-blue-500" />,
      value: "payment",
    },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="flex flex-row gap-0 max-h-[70%] h-[70%] min-w-[80%] ring-1 ring-input !rounded-xl !shadow-none bg-transparent !p-0 overflow-hidden">
        <Navbar page={page} setPage={setPage} settings={settings} />
        <DialogClose className="absolute right-8 top-11">
          <Button
            type="button"
            size={"icon"}
            variant="secondary"
            className="rounded-[12px] border"
          >
            <X />
          </Button>
        </DialogClose>
        <Content page={page} setPage={setPage} settings={settings} />
      </DialogContent>
    </Dialog>
  );
}

function Navbar(props: {
  page: any;
  setPage: (value: any) => void;
  settings: Array<any>;
}) {
  return (
    <div className="h-full bg-accent min-w-[230px] border-r border-input pt-8 px-2">
      <div className="text-secondary font-medium text-xs ml-4">Settings</div>
      <div className="flex gap-2 flex-col mt-3">
        {props.settings.map((item, i) => {
          return (
            <div
              key={i}
              className={`w-full px-4 py-[5px] flex flex-row gap-2 cursor-pointer select-none items-center hover:bg-zinc-400/15 text-primary font-medium text-sm rounded-[8px] ${
                props.page === item.value ? "bg-zinc-400/15" : ""
              }`}
              onClick={() => props.setPage(item.value)}
            >
              {item.icon}
              {item.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Content(props: {
  page: any;
  setPage: (value: any) => void;
  settings: Array<any>;
}) {
  function content() {
    switch (props.page) {
      case "general":
        return <SettingGeneralPage />;
      case "applications":
        return <SettingAppsPage />;
      case "payment":
        return <SettingPaymentPage />;
    }
  }
  return (
    <div className="w-full h-full overflow-y-scroll bg-white p-8 pt-11 pl-10 flex flex-col gap-5">
      <div className="text-2xl font-semibold mb-3">
        {props.settings.map((setting) => {
          return setting.value === props.page ? setting.name : undefined;
        })}
      </div>
      {content()}
    </div>
  );
}
