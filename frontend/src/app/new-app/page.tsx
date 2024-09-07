"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import Footer from "@/components/website/layout/footer/footer";
import { useState } from "react";
import { Camera, Loader } from "react-feather";

export default function NewTeam() {
  return (
    <div className="flex flex-col">
      <WebContainer className="h-[100vh] w-[100vw]">
        <AuthNavbar href="/dashboard" button="Dashboard" />
        <ContentContainer className="flex h-full items-center justify-center">
          {/* /Breadcrumb */}
          <div className="mx-auto flex w-[500px] flex-col gap-6">
            <div className="flex flex-col gap-[5px]">
              <div className="text-xl font-medium">New Application</div>
              <div className="text-sm text-secondary">
                We&apos;ll fill the billing details automatically if we find the
                company.
              </div>
            </div>
            {/* Inputs */}
            <Inputs />
            {/* Continu btn */}
            <Button className="w-full rounded-[12px]">
              Create application
            </Button>
            {/* </Link> */}
          </div>
        </ContentContainer>
      </WebContainer>
      <Footer border bg="secondary" type="default" />
    </div>
  );
}

function Inputs(props: {}) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-[15px]">
      {/* Name */}
      <div className="flex w-full items-center gap-5">
        <Avatar className="relative size-[65px] cursor-pointer items-center justify-center !rounded-[16px] overflow-visible ">
          {loading ? (
            <>
              <AvatarImage src="" className="rounded-[16px]" />
              <AvatarFallback className="!rounded-[16px]">
                <Loader className="text-primary animate-spin" />
              </AvatarFallback>
            </>
          ) : (
            <Label className="relative h-full w-full cursor-pointer">
              <AvatarFallback className="!rounded-[16px] w-full h-full">
                <Camera className="text-secondary" />
              </AvatarFallback>
              <Input
                type="file"
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Label>
          )}
        </Avatar>
        <Label className="flex w-full flex-col gap-2">
          Name
          <Input
            className="h-[40px] rounded-[12px] border-none bg-accent"
            placeholder="Name..."
          />
        </Label>
      </div>

      {/* Description */}
      <Label className="flex flex-col gap-2">
        Description
        <Textarea
          className="min-h-[120px] resize-none rounded-[12px] border-none bg-accent"
          placeholder="Description..."
        />
      </Label>
    </div>
  );
}
