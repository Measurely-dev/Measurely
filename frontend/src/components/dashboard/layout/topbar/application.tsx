"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AppsContext } from "@/dashContext";
import { CaretSortIcon, CheckIcon, PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useContext, useState } from "react";

export default function ApplicationsChip() {
  const [open, setOpen] = useState(false);

  const { applications, activeApp, setActiveApp } = useContext(AppsContext);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-fit gap-2 rounded-[12px] border-none px-2 text-[14px] ${
            open ? "bg-accent" : ""
          }`}
        >
          <Avatar className="size-6 border bg-accent">
            <AvatarImage
              src={`${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${applications?.[activeApp]?.image}`}
            />
            <AvatarFallback>
              {applications?.[activeApp].name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {applications?.[activeApp].name}
          <CaretSortIcon className="size-5 shrink-0 text-secondary opacity-80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-[250px] flex-col gap-1 rounded-2xl p-1.5 shadow-sm"
        side="bottom"
        align="start"
      >
        {applications?.map((app, i) => {
          return (
            <div
              key={i}
              className="flex w-full cursor-pointer select-none flex-row items-center justify-between rounded-xl p-2 py-1.5 hover:bg-accent/75"
              onClick={() => {
                setActiveApp(i)
                setOpen(false)
              }}
            >
              <div className="flex flex-row items-center justify-center gap-2">
                <Avatar className="size-6 border bg-accent">
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${app.image}`}
                  />
                  <AvatarFallback>
                    {app.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-[14px] font-medium">{app.name}</div>
              </div>
              <CheckIcon className={`size-4 ${activeApp === i ? "" : "hidden"}`} />
            </div>
          );
        })}
        <Link href={"/dashboard/new-app"}>
          <Button
            variant={"secondary"}
            className="mt-1 flex w-full items-center justify-start gap-2 rounded-xl bg-accent/75 px-2 text-[14px] font-normal"
          >
            <PlusIcon className="ml-1 mr-1 size-4 stroke-2" />
            New Application
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
