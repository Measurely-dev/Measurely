import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShowcaseCursor from "./cursor";
import { Button } from "@/components/ui/button";

export default function Card5(props: { className?: string }) {
  return (
    <Card className={`w-[320px] rounded-2xl shadow-sm p-5 ${props.className}`}>
      <ShowcaseCursor
        cursor={2}
        className="!absolute bottom-[-0px] !rotate-[-9deg] right-[-80px]"
      />
      <CardHeader className="p-0">
        <CardTitle>New milestone</CardTitle>
        <CardDescription className="text-xs">
          Clearing all the created metrics is a irreversible action, think before doing it.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-5 flex w-full flex-col gap-3 p-0">
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="Title" className="text-xs">
            Title
          </Label>
          <Input
            type="text"
            placeholder="Write application name..."
            className="text-xs placeholder:text-xs"
          />
        </div>
        <Button className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500" variant={"destructiveOutline"} size="sm">
          Clear all metrics
        </Button>
      </CardContent>
    </Card>
  );
}
