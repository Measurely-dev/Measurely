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
import { MinusIcon } from "lucide-react";

export default function Card1(props: { className?: string }) {
  return (
    <Card className={`w-[340px] rounded-2xl p-5 shadow-sm ${props.className}`}>
      <div className="absolute bottom-[-10px] left-[-10px] size-8 rounded-[10px] bg-zinc-300/30 border backdrop-blur-md flex text-sm text-red-400 items-center justify-center font-mono z-10">
        -1
      </div>
      <div className="w-full top-0 left-0 h-full absolute bg-zinc-300/15 backdrop-blur-md gap-3 flex-col flex justify-center items-center rounded-2xl text-red-400 text-sm">
        <div className="flex aspect-square h-[60px] items-center justify-center rounded-full border border-red-400 bg-red-400/10 text-red-400">
          <MinusIcon className="size-8 stroke-[2]" />
        </div>
        Account deleted
      </div>
      <CardHeader className="p-0">
        <CardTitle>New milestone</CardTitle>
        <CardDescription className="text-xs">
          By creating a milestone, you send a step request to the client of this
          project.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-5 flex w-full flex-col gap-3 p-0">
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="Title" className="text-xs">
            Title
          </Label>
          <Input
            type="text"
            placeholder="Title"
            className="text-xs placeholder:text-xs"
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="Title" className="text-xs">
            Description
          </Label>
          <Input
            type="text"
            placeholder="Descripiton"
            className="text-xs placeholder:text-xs"
          />
        </div>
        <Button className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500" variant={"destructiveOutline"} size="sm">
          Create milestone
        </Button>
      </CardContent>
    </Card>
  );
}
