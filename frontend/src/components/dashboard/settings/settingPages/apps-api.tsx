import React from "react";
import SettingCard from "../../components/settingCard";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { AppsContext } from "@/dashContext";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ApiDialog from "../../components/apiDialog";
import Empty from "../../components/empty";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditDialogContent from "../../components/EditDialogContent";
import { Group, GroupType } from "@/types";

export default function SettingAppsPage() {
  const { activeApp, applications } = useContext(AppsContext);
  return (
    <div>
      <SettingCard
        title="My applications"
        description="This is a list of all the applications that you created or are apart of."
        content={
          <div className="flex flex-col gap-4">
            {applications?.length === 0 ? (
              <Empty>No app found</Empty>
            ) : (
              applications?.map((app, i: any) => {
                return (
                  <div
                    key={i}
                    className={`hover:bg-accent p-2 rounded-[16px] ${applications?.[activeApp]?.name === app.name ? "bg-accent border-input border hover:bg-accent" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-row gap-2 items-center">
                        <Avatar className="size-10 border rounded-[12px] bg-accent">
                          <AvatarImage
                            src={`${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${app?.image}`}
                          />
                          <AvatarFallback>
                            {app?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium leading-none">
                            {app?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                        <ApiDialog randomize app={app?.name}>
                          <Button
                            variant={"outline"}
                            size={"sm"}
                            className="rounded-[12px]"
                          >
                            Api key
                          </Button>
                        </ApiDialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant={"default"}
                              size={"sm"}
                              className="rounded-[12px]"
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        }
      />
    </div>
  );
}
