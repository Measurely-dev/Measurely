import React, { FormEvent, ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// SettingCard: A reusable card component for settings/configuration UI
// Supports disabled states, danger styling, and optional action buttons
const SettingCard = (props: {
  title: string; // Title text for the card
  description: string; // Description text below title
  content: ReactNode; // Main content of the card
  btn_loading: boolean; // Loading state for action button
  btn_disabled: boolean; // Disabled state for action button
  disabled?: boolean | false; // Whether the entire card is disabled
  disabled_text?: ReactNode; // Text to show when card is disabled
  action?: (_: FormEvent<HTMLFormElement>) => void; // Form submit handler
  btn?: string; // Button text (if button should be shown)
  danger?: boolean | false; // Whether to show danger styling
}) => {
  return (
    <form className="flex flex-col" onSubmit={props.action}>
      {/* Main card wrapper with optional danger styling */}
      <Card
        className={`relative overflow-hidden rounded-[12px] ${props.danger ? "border-red-500/40" : ""}`}
      >
        {/* Disabled overlay with blur effect */}
        {props.disabled ? (
          <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-4 bg-accent/20 backdrop-blur-lg">
            {props.disabled_text}
          </div>
        ) : (
          <></>
        )}
        {/* Card content container with conditional danger styling */}
        <div
          className={`p-5 ${props.danger ? "text-red-500" : ""} ${props.btn !== undefined ? "" : "pb-6"} ${props.danger ? "border-red-500 bg-red-500/10" : ""}`}
        >
          <CardHeader className="mb-4 p-0">
            <CardTitle>{props.title}</CardTitle>
            <CardDescription className={props.danger ? "text-red-500" : ""}>
              {props.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">{props.content}</CardContent>
        </div>
        {/* Optional footer with action button */}
        {props.btn !== undefined ? (
          <CardFooter className="border-t p-5 pt-4">
            <Button
              className="w-full rounded-[10px]"
              type="submit"
              loading={props.btn_loading}
              disabled={props.btn_loading || props.btn_disabled}
            >
              {props.btn}
            </Button>
          </CardFooter>
        ) : undefined}
      </Card>
    </form>
  );
};

export default SettingCard;
