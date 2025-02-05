"use client";

// Required imports for components and assets
import { Question } from "@/components/global/faq-questions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { plans } from "@/plans";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  ChartArea,
  ChartColumn,
  ChartScatter,
  ChevronRight,
  Gauge,
  LayoutGridIcon,
  MoveRight,
  Plus,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import FooterHeader from "../footer-header";
import PricingCard from "../global/pricing-card";
import HeroTitle from "../hero-title";
import { Button } from "../ui/button";
import { TiltedScroll } from "../ui/tilted-scroll";
import { Globe } from "../ui/globe";
import { Safari } from "../ui/safari";
import { OrbitingCircles } from "../ui/orbiting-circles";

// Main Body component that handles the landing page layout
export default function Body(props: { type: "waitlist" | "register" }) {
  // Track window width for responsive layout
  const [window_width, set_window_width] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      set_window_width(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine BentoBox layout based on screen width
  const bentoBoxType = window_width > 768 ? "horizontal-left" : "vertical";
  const customItems = [
    { id: "1", text: "Unique visitors" },
    { id: "2", text: "Average session duration" },
    { id: "3", text: "Page views" },
    { id: "4", text: "Conversion rate" },
    { id: "5", text: "Bounce rate" },
    { id: "6", text: "Exit rate" },
    { id: "7", text: "Time on page" },
    { id: "8", text: "Pages per session" },
    { id: "9", text: "returning visitors" },
    { id: "10", text: "Traffic sources" },
  ];
  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex text-primary pb-24 pt-10 w-full flex-col items-center gap-5 text-center max-md:h-fit max-md:min-h-[50vh]">
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
        <h1 className="flex-col !text-[3.6rem] font-medium text-primary !leading-tight max-lg:!text-[3rem] max-md:!text-[2rem] max-sm:!text-[1.9rem] md:inline-flex">
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
      <div className="w-full bg-background pb-[150px] text-primary">
        {/* Hero Section */}
        <BentoBox
          type={bentoBoxType}
          className="group"
          title="Simplify Your Metrics"
          description="Measurely is your all-in-one solution for tracking and analyzing key metrics. With our API integration, monitor data in real-time and access detailed insights at your fingertips."
          content={
            <div className="h-[300px] overflow-hidden items-end flex flex-col relative">
              <TiltedScroll items={customItems} className="my-auto" />
            </div>
          }
        />

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-2">
          <BentoBox
            type="vertical"
            className="mt-5 relative"
            title="Track Metrics in Real Time"
            description="Visualize live data changes across your metrics. Stay updated with real-time insights and effortlessly track key metrics as they evolve."
            content={
              <div className="w-full h-full min-h-[300px] max-h-full flex items-center flex-col overflow-hidden">
                <Globe className="top-44 gradient-mask-tr-40" />
              </div>
            }
          />

          <BentoBox
            type="vertical"
            className="mt-5 max-md:mt-0"
            title="Seamless Integration"
            contentClassName="!w-full !min-w-none max-w-[90%] min-h-none h-fit"
            description="Start tracking your metrics effortlessly with our straightforward API & SDKs setup."
            content={
              <div className="w-full  h-full max-h-fit pb-5 flex items-center flex-col overflow-hidden">
                <Safari
                  url="measurely.dev"
                  lightModeUrl="https://media.measurely.dev/Screenshot%20From%202025-02-05%2012-46-11.png"
                  darkModeUrl="https://media.measurely.dev/Screenshot%20From%202025-02-05%2012-46-00.png"
                  className="size-full border shadow-sm shadow-black/5 rounded-[6px] p-0"
                />
              </div>
            }
          />
        </div>

        {/* Additional Feature Section */}
        <BentoBox
          type={bentoBoxType}
          className="mt-5"
          title="Multiple Metric Types"
          description="Track both single and dual metrics. Single metrics monitor growth, while dual metrics capture positive and negative trends for deeper analysis."
          content={
            <div className="relative [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_5rem),linear-gradient(to_left,transparent,black_5rem),linear-gradient(to_bottom,transparent,black_5rem),linear-gradient(to_top,transparent,black_5rem)] flex h-[350px] p-10 w-full flex-col items-center justify-center overflow-hidden">
              <span className="pointer-events-none z-0 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300 bg-clip-text text-center text-7xl font-semibold leading-none text-transparent dark:from-white dark:to-black">
                Metrics
              </span>

              {/* Inner Circles */}
              <OrbitingCircles
                className="size-[35px] border-input -z-10"
                duration={20}
                delay={20}
                radius={80}
              >
                <ChartColumn className="size-4" />
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[35px] border-input"
                duration={20}
                delay={10}
                radius={80}
              >
                <ChartArea className="size-4" />
              </OrbitingCircles>

              {/* Outer Circles (reverse) */}
              <OrbitingCircles
                className="size-[50px] border-none"
                radius={190}
                duration={20}
                reverse
              >
                <ChartScatter className="size-5" />
              </OrbitingCircles>
            </div>
          }
        />

        {/* Subscription Section */}
        <LandingPageBodyPricing />

        {/* Benefits Section */}
        <HeroTitle
          subtitle="Metrics Simplified"
          className="mt-[145px]"
          title="Focus on What Matters with Measurely"
        />

        {/* Feature Boxes */}
        <div className="mt-[70px] grid grid-cols-3 gap-[10px] max-md:grid-cols-1">
          <Box
            icon={
              <Gauge className="size-10 stroke-[1] text-muted-foreground" />
            }
            title="Instant Insights"
            description="Gain real-time data insights for fast and informed decision-making."
          />
          <Box
            icon={
              <SparklesIcon className="size-10 stroke-[1] text-muted-foreground" />
            }
            title="Custom Metrics"
            description="Tailor your tracking to suit unique business needs with flexible metric options."
          />
          <Box
            icon={
              <LayoutGridIcon className="size-10 stroke-[1] text-muted-foreground" />
            }
            title="Effortless Integration"
            description="Connect easily with your current tools and workflows without hassle."
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-[145px] rounded-3xl bg-background pt-12">
          <HeroTitle subtitle="FAQ" title="Frequently Asked Questions" />
          <div className="mt-[70px] flex w-full items-start justify-center">
            <div className="w-full">
              <Accordion
                type="single"
                collapsible
                className="w-full -space-y-px rounded-[12px] shadow-sm shadow-black/5"
                defaultValue="3"
              >
                {Question.map((item) => (
                  <AccordionItem
                    value={item.answer}
                    key={item.id}
                    className="border bg-background px-4 py-1 first:rounded-t-[12px] last:rounded-b-[12px]"
                  >
                    <AccordionPrimitive.Header className="flex">
                      <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-3 py-2 text-left text-[15px] font-semibold leading-6 transition-all [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&>svg]:-order-1 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0 [&[data-state=open]>svg]:rotate-180">
                        {item.question}
                        <Plus
                          size={16}
                          strokeWidth={2}
                          className="shrink-0 opacity-60 transition-transform duration-200"
                          aria-hidden="true"
                        />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionContent className="pb-2 text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Footer */}
        <FooterHeader className="mt-[170px]" type="waitlist" />
      </div>
    </div>
  );
}

// BentoBox component for displaying feature sections with different layouts
function BentoBox(props: {
  className?: string;
  type: "horizontal-left" | "horizontal-right" | "vertical";
  title: string;
  description: string;
  contentClassName?: string;
  content: ReactNode;
}) {
  const render = () => {
    switch (props.type) {
      case "horizontal-left":
        return (
          <div
            className={`grid w-full bg-card grid-cols-[4fr,1fr] overflow-hidden rounded-[16px] border p-0 !pb-0 shadow-sm ${props.className}`}
          >
            <div className="flex h-full w-full flex-col justify-between p-[30px] pr-0">
              <div className="text-xl font-semibold">{props.title}</div>
              <div className="text-base font-normal text-muted-foreground">
                {props.description}
              </div>
            </div>
            <div className={`min-w-[400px] ${props.contentClassName}`}>
              {props.content}
            </div>
          </div>
        );
      case "horizontal-right":
        return (
          <div
            className={`grid w-full grid-cols-[1fr,4fr] overflow-hidden rounded-[16px] border bg-card p-0 !pb-0 shadow-sm ${props.className}`}
          >
            <div className={`min-w-[400px] ${props.contentClassName}`}>
              {props.content}
            </div>
            <div className="flex h-full w-full flex-col justify-between p-[30px] pl-0">
              <div className="text-xl font-semibold">{props.title}</div>
              <div className="text-base font-normal text-muted-foreground">
                {props.description}
              </div>
            </div>
          </div>
        );
      case "vertical":
        return (
          <div
            className={`grid w-full overflow-hidden rounded-[16px] border bg-card p-0 !pb-0 shadow-sm ${props.className}`}
          >
            <div className="flex h-fit w-full flex-col justify-between gap-8 p-[30px]">
              <div className="text-xl font-semibold">{props.title}</div>
              <div className="text-base font-normal text-muted-foreground">
                {props.description}
              </div>
            </div>
            <div
              className={`min-w-none mx-auto flex h-fit max-h-[500px] max-w-[450px] items-center justify-center ${props.contentClassName}`}
            >
              {props.content}
            </div>
          </div>
        );
    }
  };
  return render();
}

// Box component for displaying feature highlights with icons
function Box(props: {
  className?: string;
  title: string;
  icon: ReactNode;
  description: string;
}) {
  return (
    <div className="flex h-[350px] flex-col items-center gap-[30px] rounded-[16px] border bg-card px-[25px] py-5 pt-16 shadow-sm shadow-black/5">
      <div className="flex size-[80px] items-center justify-center rounded-full border bg-accent/50">
        {props.icon}
      </div>
      <div className="flex flex-col gap-5 text-center">
        <div className="text-xl font-semibold">{props.title}</div>
        <div className="text-base text-muted-foreground">
          {props.description}
        </div>
      </div>
    </div>
  );
}

function LandingPageBodyPricing() {
  // State for managing loading state and selected plan
  const router = useRouter();

  return (
    <div className="mt-[145px] pt-12">
      {/* Pricing section header */}
      <HeroTitle
        title="Pricing that fits your need"
        subtitle="Transparent pricing"
      />

      {/* Grid of pricing cards */}
      <div className="mt-[70px] grid grid-cols-3 max-md:grid-cols-1 max-md:gap-3">
        {plans.map((plan, i) => {
          return (
            <PricingCard
              key={i}
              startingFrom
              name={plan.name}
              className={`md:first:rounded-e-none md:first:border-r-0 md:last:rounded-s-none md:last:border-l-0 ${plan.name === "Plus" ? "md:z-10 md:scale-105 md:bg-background md:shadow-xl" : ""}`}
              description={plan.description}
              price={plan.price}
              recurrence={plan.reccurence}
              target={plan.target}
              list={plan.list}
              button={
                plan.identifier === "starter"
                  ? "Get started"
                  : "Continue with " + plan.name
              }
              onSelect={() => {
                router.push("https://app.measurely.dev/waitlist");
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
