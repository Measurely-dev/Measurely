import { Button } from "@/components/ui/button";
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
import { CheckIcon } from "lucide-react";

export default function Card2(props: { className?: string }) {
  return (
    <Card className={`w-[320px] rounded-2xl p-5 shadow-sm ${props.className}`}>
      <ShowcaseCursor
        cursor={1}
        className="!absolute top-[-26px] !rotate-[-9deg] left-[135px]"
      />
      <CardHeader className="p-0">
        <CardTitle>New metric</CardTitle>
        <CardDescription className="text-xs">
          By creating a metrtic, you create a new data value that we store for
          you
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-5 flex w-full flex-col gap-3 p-0">
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="Title" className="text-xs">
            Name
          </Label>
          <Input
            type="text"
            placeholder="Title"
            defaultValue="Users count"
            className="text-xs placeholder:text-xs"
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="Title" className="text-xs">
            Base value
          </Label>
          <Input
            type="number"
            placeholder="Value"
            defaultValue="584"
            className="text-xs placeholder:text-xs"
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="Title" className="text-xs">
            Type
          </Label>
          <Select>
            <SelectTrigger className="h-[30px] rounded-[6px] border text-xs text-primary">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent className="rotate-[7deg] max-lg:rotate-0">
              <SelectGroup>
                <SelectItem value="high">Number</SelectItem>
                <SelectItem value="medium">Value</SelectItem>
                <SelectItem value="low">String</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" size="sm">
          Create metric
        </Button>
      </CardContent>
    </Card>
  );
}
