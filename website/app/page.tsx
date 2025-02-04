// Import required components and dependencies
import Body from "@/components/page-content/landing-page-body";
import { Button } from "@/components/ui/button";
import { ChevronRight, MoveRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "Build fast, customizable, and content-rich websites with Nextra. Powered by Next.js, it offers seamless Markdown support, customizable themes, file conventions, and easy integration with MDX, making it perfect for documentation, blogs, and static websites.",
};

// Define the type for the Home component's props
// interface HomeProps {
//   searchParams?: { [key: string]: string | string[] | undefined };
// }

// Home page component that handles analytics tracking and renders the landing page
// export default function Home({ searchParams }: HomeProps) {
export default function Home() {
  // if (process.env.NEXT_PUBLIC_ENV === "production") {
  //   let ref =
  //     searchParams?.["ref"] === undefined
  //       ? "direct"
  //       : (searchParams["ref"] as string);

  //   const refs = [
  //     "reddit",
  //     "twitter",
  //     "discord",
  //     "bluesky",
  //     "producthunt",
  //     "direct",
  //     "launchtory",
  //     "quora",
  //     "indiehackers",
  //   ];

  //   if (!refs.includes(ref)) ref = "direct";

  //   Measurely.init(process.env.NEXT_PUBLIC_MEASURELY_API_KEY ?? "");

  //   const metricId = "beff3986-f11f-4e19-93e0-7654604f1d3b";
  //   const payload = {
  //     value: 1,
  //     filters: {
  //       "traffic source": ref,
  //     },
  //   };

  //   Measurely.capture(metricId, payload);
  // }

  return (
    <div className="flex flex-col">
      <Landing type="waitlist" />
      <Body />
    </div>
  );
}

// Landing component renders the main hero section
function Landing(props: { type: "default" | "waitlist" }) {
  return (
    <>
      <div className="flex py-24 w-screen flex-col items-center gap-5 text-center max-md:h-fit max-md:min-h-[50vh]">
        <Link
          href={"/blog/3"}
          className="group flex cursor-pointer select-none flex-row items-center gap-3 rounded-full border border-input bg-accent p-0.5 pr-1 text-sm shadow-sm shadow-black/5 transition-all duration-200 hover:shadow-black/10 max-sm:scale-90"
        >
          <div className="rounded-full border bg-background px-3 py-1">
            <span className="font-mono">Open Source</span>
          </div>
          <span className="flex w-[110px] flex-row items-center justify-between gap-2 pr-2 transition-all duration-200 group-hover:pr-1">
            Learn more <MoveRight className="size-4" />
          </span>
        </Link>
        <h1 className="flex-col text-[3.6rem] font-medium leading-tight max-lg:text-[3rem] max-md:text-[2rem] max-sm:text-[1.9rem] md:inline-flex">
          Track All Your Metrics <br />
          <span className="animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text text-transparent">
            In One Powerful Platform
          </span>
        </h1>

        <div className="text-md w-[95%] max-md:max-w-[400px] max-lg:max-w-none flex-col font-medium max-md:text-sm md:inline-flex">
          <span>Measurely is an open source analytics platform. </span>
          <span>
            Start tracking with real-time metrics, API integrations,
            <br className="max-md:hidden" /> blocks, data visualizations, and
            powerful team collaboration tools.
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            href={
              props.type === "waitlist"
                ? "https://app.measurely.dev/waitlist"
                : "https://app.measurely.dev/register"
            }
          >
            <Button className="rounded-[12px]">
              {props.type === "waitlist" ? "Join wailist" : "Start tracking"}
            </Button>
          </Link>
          <Link href={"/docs/"}>
            <Button variant={"outline"} className="rounded-[12px]">
              Read docs
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
