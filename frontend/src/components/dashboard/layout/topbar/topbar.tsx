"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { Bell, MessageSquare, User } from "react-feather";
import FeedbackPopover from "../../components/feedbackPopover";
import InboxPopover from "../../components/inboxPopover";

import AvatarDropdown from "./dropdown";
import TeamChip from "./team";
// import TeamType from './type';

export default function DashboardTopbar() {
  return (
    <div className="flex h-[50px] w-full flex-row justify-between border-b border-accent pr-[15px]">
      <div className="flex h-[40px] w-full flex-row items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          {/* <TeamChip /> */}
          {/* <TeamType /> */}
        </div>
        <div className="flex flex-row gap-[12px]">
          <FeedbackPopover>
            <Button
              className="h-[35px] gap-[8px] rounded-[12px] text-secondary hover:text-primary"
              variant="secondary"
            >
              <MessageSquare className="size-[16px]" />
              Feedback
            </Button>
          </FeedbackPopover>
          <InboxPopover>
            <Button
              className="size-[35px] rounded-[12px] text-secondary hover:text-primary"
              variant="secondary"
              size="icon"
            >
              <Bell className="size-1/2" />
            </Button>
          </InboxPopover>
          <AvatarDropdown>
            <Avatar className="size-[35px] cursor-pointer">
              <AvatarImage src="https://avatars.githubusercontent.com/u/115744911?v=4" className="rounded-full" />
              <AvatarFallback>ZF</AvatarFallback>
            </Avatar>
          </AvatarDropdown>
        </div>
      </div>
    </div>
  );
}
