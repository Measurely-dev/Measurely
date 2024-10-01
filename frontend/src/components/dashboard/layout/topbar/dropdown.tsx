"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserContext } from "@/dashContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useContext } from "react";
import { ArrowUpRight } from "react-feather";

function Capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AvatarDropdown(props: { children: ReactNode }) {
  const router = useRouter();

  const { user } = useContext(UserContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent className="mr-4 mt-1 w-56 gap-1 rounded-[16px] px-2 py-3 pb-2 shadow-sm">
        <div className="mb-2 flex flex-col gap-0">
          <DropdownMenuLabel className="py-0 text-sm">
            {Capitalize(user?.firstname ?? "Unknown")}{" "}
            {Capitalize(user?.lastname ?? "")}
          </DropdownMenuLabel>
          <DropdownMenuLabel className="py-0 text-xs font-normal text-secondary">
            {user?.email === "" ? (
              <Link
                href="/dashboard/settings"
                className="cursor hover:text-blue-500"
              >
                Add your email in the settings
              </Link>
            ) : (
              user?.email
            )}
          </DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Menu item */}
          <DropdownMenuItem className="rounded-xl p-2 px-3 text-sm font-normal">
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {/* Separator */}
        <DropdownMenuSeparator />
        {/* Menu item */}
        <DropdownMenuItem className="rounded-xl p-2 px-3 text-sm font-normal">
          Discord
          <DropdownMenuShortcut>
            <ArrowUpRight className="h-3 w-3" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {/* Separator */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-xl p-2 px-3 text-sm font-normal">
          Support
          <DropdownMenuShortcut>
            <ArrowUpRight className="h-3 w-3" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <button
          className="w-full"
          onClick={() => {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/logout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }).then(() => {
              router.push("/sign-in");
            });
          }}
        >
          <DropdownMenuItem className="rounded-xl p-2 px-3 text-sm font-normal">
            Log out
            {/* Dropdown menu shortcut */}
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
