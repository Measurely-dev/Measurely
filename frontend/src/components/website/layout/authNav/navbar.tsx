import LogoSvg from "@/components/global/logoSvg";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function AuthNavbar(props: {
  button: string | null;
  href: any;
}) {
  return (
    <div className="absolute z-10 ml-[40px] mt-[40px] flex w-fit items-center gap-[30px] px-5 py-3">
      <Link href="/home">
        <div className="flex cursor-pointer items-center gap-[10px]">
          <LogoSvg className="size-8" />
          <div className="text-sm font-semibold">Measurably</div>
        </div>
      </Link>
      {props.button === null ? null : (
        <>
          <Separator className="h-5" orientation="vertical" />
          <Link href={`${props.href}`}>
            <Button className="rounded-full text-sm" variant="secondary">
              {props.button}
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

export function AuthNavbarButton(props: {
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="absolute z-10 ml-[40px] mt-[40px] flex w-fit items-center gap-[30px] px-5 py-3">
      <Link href="/">
        <div className="flex cursor-pointer items-center gap-[10px]">
          <LogoSvg className="size-8" />
          <div className="text-sm font-semibold">Measurably</div>
        </div>
      </Link>
      <Separator className="h-5" orientation="vertical" />
      <Button
        className="rounded-full text-sm"
        variant="secondary"
        onClick={props.onClick}
      >
        {props.button}
      </Button>
    </div>
  );
}
