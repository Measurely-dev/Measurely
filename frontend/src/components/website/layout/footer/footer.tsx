import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import WebButton from "../../components/button";
import { footerData } from "./footerData";
import FooterLink from "./footerLink";
import LogoSvg from "@/components/global/logoSvg";

export default function Footer(props: {
  border: boolean;
  bg: "default" | "secondary";
  type: "default" | "waitlist";
}) {
  return (
    <footer
      className={`relative z-10 flex w-screen flex-col items-center justify-center px-10 pt-10 pb-10 border-t 
      ${props.bg === "default" ? "bg-background" : "bg-secondaryColor"}
      ${props.border === true ? "border-t" : ""}
      `}
    >
      <div className="z-10 flex w-full max-w-[1100px] flex-col gap-8">
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-2 items-center text-secondary">
            <LogoSvg className="size-10" />© 2024
          </div>
          <Link href="/waitlist">
            <WebButton>
              {props.type === "default" ? "Get started" : "Join waitlist"}
            </WebButton>
          </Link>{" "}
        </div>
        <div className="flex w-full justify-between max-md:flex-col">
            {footerData.map((link, i) => {
              return <FooterLink href={link.href} key={i} name={link.title} />;
            })}
        </div>
      </div>
    </footer>
  );
}
