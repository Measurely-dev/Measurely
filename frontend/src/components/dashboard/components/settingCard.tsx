import React, { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SettingCard = (props: {
  title: string;
  description: string;
  content: ReactNode;
  btn?: string | undefined;
  action?: (value: any) => void;
}) => {
  return (
    <Card>
      <div className={`p-6 ${props.btn !== undefined ? "" : "pb-6"}`}>
        <CardHeader className="p-0 mb-4">
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">{props.content}</CardContent>
      </div>
      {props.btn !== undefined ? (
        <CardFooter className="border-t p-4 px-6">
          <Button className="rounded-[12px] w-full" onClick={props.action}>
            {props.btn}
          </Button>
        </CardFooter>
      ) : undefined}
    </Card>
  );
};

export default SettingCard;
