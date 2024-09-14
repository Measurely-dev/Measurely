"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {MessageSquare, Plus, User } from "react-feather";
import FeedbackPopover from "../../components/feedbackPopover";

import AvatarDropdown from "./dropdown";
import ApplicationsChip from "./application";
import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "@/dashContext";

export default function DashboardTopbar() {

  const {user} = useContext(UserContext)


  return (
    <div className="flex h-[50px] w-full flex-row justify-between border-b border-accent pr-[15px]">
      <div className="flex h-[40px] w-full flex-row items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          <ApplicationsChip />
          {/* <ApplicationType type={"Pro"} /> */}
        </div>
        <div className="flex flex-row gap-[12px]">
          <Link href={"/new-metric"}>
            <Button className="h-[35px] gap-[8px] rounded-[12px]">
              <Plus className="size-[16px]" />
              Create metric
            </Button>
          </Link>
          <FeedbackPopover>
            <Button
              className="h-[35px] gap-[8px] rounded-[12px] text-secondary hover:text-primary"
              variant="secondary"
            >
              <MessageSquare className="size-[16px]" />
              Feedback
            </Button>
          </FeedbackPopover>
          {/* <InboxPopover>
            <Button
              className="size-[35px] rounded-[12px] text-secondary hover:text-primary"
              variant="secondary"
              size="icon"
            >
              <Bell className="size-1/2" />
            </Button>
          </InboxPopover> */}
          <AvatarDropdown>
            <Avatar className="size-[35px] cursor-pointer text-secondary hover:text-primary">
              <AvatarImage src={`${process.env.NEXT_PUBLIC_FILE_URL}/uploads/${user?.image}`} className="rounded-full" />
              <AvatarFallback>
                {" "}
                <User className="size-1/2" />
              </AvatarFallback>
            </Avatar>
          </AvatarDropdown>
        </div>
      </div>
    </div>
  );
}
