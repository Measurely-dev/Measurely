"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreditCard, Hexagon, Home, X } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import GeneralSettings from "./setting-pages/general";
import PaymentSettings from "./setting-pages/payment";
import { Button } from "@/components/ui/button";
import ProjectsSettings from "./setting-pages/projects";

interface SettingPage {
  name: string;
  icon: ReactNode;
  value: string;
}

export default function SettingDialog(props: { children: ReactNode }) {
  const [page, setPage] = useState("general");
  const settings: SettingPage[] = [
    {
      name: "General",
      icon: <Home className="size-4 stroke-[2px]" />,
      value: "general",
    },
    {
      name: "Projects",
      icon: <Hexagon className="size-4 stroke-[2px]" />,
      value: "projects",
    },
    {
      name: "Payment",
      icon: <CreditCard className="size-4 stroke-[2px]" />,
      value: "payment",
    },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="flex h-[70%] max-h-[70%] min-w-[80%] flex-row gap-0 overflow-hidden !rounded-xl bg-transparent !p-0 max-lg:min-w-[95%] max-md:min-h-[95%] max-md:max-w-[95%] max-md:flex-col lg:min-w-[900px] lg:max-w-[900px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Settings dialog
        </DialogDescription>
        <Navbar page={page} setPage={setPage} settings={settings} />
        <DialogClose
          className="absolute right-8 top-11 max-md:right-4 max-md:top-4"
          asChild
        >
          <Button
            type="button"
            size={"icon"}
            variant="secondary"
            className="rounded-[12px] border max-md:bg-background md:hidden"
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
  page: string;
  setPage: Dispatch<SetStateAction<string>>;
  settings: SettingPage[];
}) {
  return (
    <div className="max-md:min-w-none h-full min-w-[230px] border-r border-input bg-accent dark:bg-card px-2 pt-8 max-md:h-fit max-md:border-b max-md:pb-4">
      <div className="ml-4 text-xs font-medium text-muted-foreground">
        Settings
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {props.settings.map((item, i) => {
          return (
            <div
              key={i}
              className={`flex w-full cursor-pointer select-none flex-row items-center gap-2 rounded-[8px] border border-transparent px-4 py-[5px] text-sm font-medium text-primary hover:border-input hover:bg-input/50 ${
                props.page === item.value
                  ? "!border !border-input bg-input/50"
                  : ""
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
  page: string;
  setPage: Dispatch<SetStateAction<string>>;
  settings: Array<SettingPage>;
}) {
  function content() {
    switch (props.page) {
      case "general":
        return <GeneralSettings />;
      case "projects":
        return <ProjectsSettings />;
      case "payment":
        return <PaymentSettings />;
    }
  }
  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-scroll bg-background p-8 pl-10 pt-11 max-md:px-4">
      <div className="mb-3 text-2xl font-semibold">
        {props.settings.map((setting) => {
          return setting.value === props.page ? setting.name : undefined;
        })}
      </div>
      {content()}
    </div>
  );
}
