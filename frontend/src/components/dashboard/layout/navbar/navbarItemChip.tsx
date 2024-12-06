import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { ReactNode } from "react";
import { BookOpen } from "react-feather";

export default function NavbarItemChip() {
  const itemList = [
    {
      label: "Docs",
      href: "/docs/getting-started/introduction",
      icon: <BookOpen className="size-[18px]" />,
    },
  ];
  return (
    <div className="flex flex-col gap-[6px] p-1 bg-accent rounded-[16px]  w-[45px] min-w-[45px]">
      {itemList.map((item, i) => {
        return (
          <Item label={item.label} key={i} href={item.href}>
            {item.icon}
          </Item>
        );
      })}
    </div>
  );
}

function Item(props: { children: ReactNode; label: string; href: string }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Link href={props.href}>
            <div
              className={`flex hover:bg-background hover:text-primary transition-all duration-200 py-1.5 items-center justify-center text-secondary rounded-[12px] text-[20px]`}
            >
              {props.children}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="rounded-[6px] border bg-accent p-1 px-2 text-xs font-medium text-primary"
        >
          {props.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
