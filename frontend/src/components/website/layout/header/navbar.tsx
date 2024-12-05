import LogoSvg from "@/components/global/logoSvg";
import Link from "next/link";
import Actions from "./actions";
import Links from "./links";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
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
    <div className="fixed top-5 z-50 flex items-center gap-6 rounded-[20px] border border-background bg-accent/75 px-3 py-2 pl-4 backdrop-blur-xl">
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
      {/* Actions group */}
      <Actions type={props.type} />
      <Drawer>
        <DrawerTrigger className="md:hidden">
          <Menu className="size-5 mr-2" />
        </DrawerTrigger>
        <DrawerContent>
          <div className="flex flex-col gap-2 px-10 py-10">
            {links.map((link: { name: string; href: string }, i: any) => {
              return (
                <DrawerClose asChild>
                  <Link
                    href={link.href}
                    key={i}
                    className="p-2 bg-accent rounded-[12px] px-4 hover:pl-6 hover:opacity-80 transition-all duration-300 cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </DrawerClose>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
