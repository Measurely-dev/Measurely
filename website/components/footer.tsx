"use client";

// Import required components and utilities
import LogoSvg from "@/components/global/logo-svg";
import Link from "next/link";
import { Button } from "./ui/button";
import { Footer as NextraFooter } from "nextra-theme-docs";
import { ThemeToggle } from "./ui/theme-toggle";
// Footer navigation data structure
const footerData = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Brand Assets", href: "/brand" },
      { name: "Blog", href: "/blog" },
      { name: "Help", href: "/help" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Pricing", href: "/pricing" },
      { name: "Basic metric", href: "/docs/features/basic-metric/" },
      { name: "Dual metric", href: "/docs/features/dual-metric/" },
      { name: "Average metric", href: "/docs/features/average-metric/" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { name: "Introduction", href: "/docs" },
      {
        name: "SDKs",
        href: "/docs/sdks/",
      },
      { name: "Integrations", href: "/docs/features/integrations" },
      { name: "Templates", href: "/docs/features/templates" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy policy", href: "/legal/privacy" },
      { name: "Terms of service", href: "/legal/terms" },
    ],
  },
];

// Main Footer component with customizable props for border, background, home status and type
export default function Footer(props: {
  border: boolean;
  bg?: "default" | "secondary";
  type: "default" | "waitlist";
}) {
  const year = new Date().getFullYear();

  return (
    <NextraFooter className="flex-col items-center">
      {/* Main footer content grid */}
      <div className="max-md: grid w-full grid-cols-5 flex-col-reverse max-md:flex">
        {/* Navigation sections */}
        <div className="col-span-4 mx-auto grid w-full grid-cols-4 max-sm:grid-cols-2">
          {footerData.map((section, i) => {
            return (
              <div className="flex flex-col gap-5 text-sm max-sm:mb-8" key={i}>
                <div className="font-mono font-medium">{section.title}</div>
                <div className="flex flex-col gap-3">
                  {section.links.map((link, i) => {
                    return (
                      <IndividualLink
                        href={link.href}
                        name={link.name}
                        key={i}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* Logo section */}
        <div className="flex w-full dark:invert flex-col items-end gap-5 max-md:mb-10 max-md:items-start">
          <Link href="/">
            <LogoSvg className="size-10" aria-hidden="true" />
            <span className="sr-only">Go to homepage</span>
          </Link>
        </div>
      </div>

      {/* Footer bottom section with social links and CTA */}
      <div className="mt-24 flex w-full items-center justify-between text-sm text-muted-foreground max-md:mt-16 max-sm:mt-6">
        <div className="flex items-center gap-1">
          <ThemeToggle className="mr-2" />
          <span>© {year}</span>
          <span className="max-md:hidden">Measurely.dev</span>
        </div>
        {/* Conditional rendering of CTA button based on type prop */}
        {props.type === "waitlist" ? (
          <Link href={"https://app.measurely.dev/waitlist"}>
            <Button className="rounded-[12px]">Join waitlist</Button>
          </Link>
        ) : (
          <Link href={"https://app.measurely.dev/register"}>
            <Button className="rounded-[12px]">Get started</Button>
          </Link>
        )}
      </div>
    </NextraFooter>
  );
}

// Component for rendering individual footer links
function IndividualLink(props: { name: string[] | string; href: string }) {
  return (
    <Link
      href={props.href}
      className="w-auto max-w-fit text-sm text-[#666666] hover:text-primary max-md:mb-1 max-md:max-w-full"
    >
      {props.name}
    </Link>
  );
}
