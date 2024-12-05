import LogoSvg from "@/components/global/logoSvg";
import Link from "next/link";
import Actions from "./actions";
import Links from "./links";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu } from "react-feather";

export default function Navbar(props: {
  type: "default" | "logged" | "waitlist";
}) {
  const links: any = [
    {
      name: "Documentation",
      href: "/Docs",
    },
    {
      name: "Pricing",
      href: "/pricing",
    },
  ];
  return (
    <div className="fixed top-5 z-50 max-md:w-[80%] max-md:justify-between flex items-center gap-6 rounded-[20px] border border-background bg-accent/75 px-3 py-2 pl-4 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/home">
        <div className="size-8">
          <LogoSvg />
        </div>
      </Link>
      {/* Links */}
      <div className="max-md:hidden">
        <Links links={links} />
      </div>
      <div className="max-md:hidden">
      {/* Actions group */}
      <Actions type={props.type} />
      </div>
      <Drawer>
        <DrawerTrigger className="md:hidden">
          <Menu className="size-5 mr-2" />
        </DrawerTrigger>
        <DrawerContent className="flex flex-col gap-2 px-10 !pt-0 py-10">
          <div className="h-8 w-full"/>
          {links.map((link: { name: string; href: string }, i: any) => {
            return (
              <DrawerClose asChild>
                <Link
                  href={link.href}
                  key={i}
                  className="p-2 text-sm bg-accent rounded-[12px] px-4 hover:pl-6 hover:opacity-80 transition-all duration-300 cursor-pointer"
                >
                  {link.name}
                </Link>
              </DrawerClose>
            );
          })}
          {/* Actions group */}
          <Actions type={props.type} />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
