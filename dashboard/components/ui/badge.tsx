import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

function BadgeSign(v: number) {
  if (v > 0) return <ArrowUp className="-ml-0.5 size-4" aria-hidden={true} />;
  else if (v < 0)
    return <ArrowDown className="-ml-0.5 size-4" aria-hidden={true} />;
  else return <Minus className="-ml-0.5 size-4" aria-hidden={true} />;
}

function BadgeColor(v: number) {
  if (v > 0)
    return "bg-green-100 border-green-500 dark:bg-green-500/30 dark:text-green-500 text-green-600";
  else if (v < 0)
    return "bg-red-100 border-red-500 dark:bg-red-500/30 dark:text-red-500 text-red-600";
  else return "border-input bg-zinc-500/10 text-zinc-500";
}

export { Badge, badgeVariants, BadgeSign, BadgeColor };
