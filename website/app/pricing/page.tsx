import { PricingQuestion } from "@/components/global/faq-questions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import Content from "@/components/content";
import FooterHeader from "@/components/footer-header";
import PricingBody from "@/components/page-content/pricing-page-body";
import PricingBodyComparaison from "@/components/page-content/pricing-page-body-comparaison";
import HeroTitle from "@/components/hero-title";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Metadata } from "next";

// Define metadata for SEO and page headers
export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore Measurely’s flexible pricing plans designed to meet the needs of developers and teams. Whether you’re just getting started or managing large-scale projects, we have a plan to help you track metrics and analyze data with ease.",
};

// Main Pricing page component
export default function Pricing() {
  return (
    <div className="w-full flex flex-col max-w-full">
      <Content type="page" className="w-[90%] pt-16">
        {/* PricingBody component to display pricing plans */}
        <PricingBody />

        {/* PricingComparaison component to display pricing comparison */}
        <PricingBodyComparaison />

        {/* FAQ Section */}
        <div className="mt-[145px] pt-12">
          {/* HeroTitle component for the FAQ section */}
          <HeroTitle subtitle="FAQ" title="Frequently Asked Questions" />

          {/* Accordion for displaying FAQs */}
          <div className="mt-[70px] flex w-full items-start justify-center">
            <div className="w-full">
              <Accordion
                type="single"
                collapsible
                className="w-full -space-y-px rounded-[12px] shadow-sm shadow-black/5"
                defaultValue="3"
              >
                {/* Map through PricingQuestion array to render each FAQ item */}
                {PricingQuestion.map((item, i) => (
                  <AccordionItem
                    value={item.answer}
                    key={i}
                    className="border bg-background px-4 py-1 first:rounded-t-[12px] last:rounded-b-[12px]"
                  >
                    {/* Accordion header with the question */}
                    <AccordionPrimitive.Header className="flex">
                      <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-3 py-2 text-left text-[15px] font-semibold leading-6 transition-all [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&>svg]:-order-1 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0 [&[data-state=open]>svg]:rotate-180">
                        {item.question}
                        {/* Plus icon for expanding/collapsing the FAQ item */}
                        <Plus
                          size={16}
                          strokeWidth={2}
                          className="shrink-0 opacity-60 transition-transform duration-200"
                          aria-hidden="true"
                        />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>

                    {/* Accordion content with the answer */}
                    <AccordionContent className="pb-2 text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* FooterHeader component for the waitlist section */}
        <FooterHeader type="waitlist" className="mt-[170px]" />
      </Content>
    </div>
  );
}
