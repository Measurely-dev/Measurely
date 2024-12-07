import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { AlignLeftIcon } from "lucide-react";
import DocsMenu from "./docs-menu";
import Link from "next/link";

export function Leftbar() {
  return (
    <aside className="md:flex hidden flex-[1] min-w-[230px] sticky top-16 flex-col h-[94.5vh] overflow-y-auto">
      <ScrollArea className="py-4">
        <DocsMenu />
      </ScrollArea>
    </aside>
  );
}

export function SheetLeftbar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden flex">
          <AlignLeftIcon className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex max-sm:w-[95%] flex-col gap-4 px-5 " side="left">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetHeader>
          <h2 className="font-extrabold text-start">Menu</h2>
        </SheetHeader>
        <ScrollArea className="flex flex-col gap-4">
        <Link href={'/register'}>
          <Button className="rounded-[12px] w-full">Get started</Button>
        </Link>
          <div className="mx-2">
            <DocsMenu isSheet />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
