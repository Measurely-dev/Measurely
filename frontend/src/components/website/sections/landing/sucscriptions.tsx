import WebPageHeader from "../../components/pageHeader";
import WebPricingCard from "../../components/pricingCard";
export default function SubscriptionUiSection() {
  return (
    <div className="bg-background rounded-3xl p-8 pt-12 mt-[145px]">
      <WebPageHeader
        title={
          <span>
            <span className="font-mono bg-gradient-to-r mr-3 from-purple-500 via-blue-500 to-pink-400 text-transparent bg-clip-text animate-gradient">
              Pricing
            </span>
            that fits
            <br /> your needs
          </span>
        }
        description=""
      />
      <div className="mt-[20px] grid grid-cols-3 max-md:grid-cols-1 gap-[10px]">
        <WebPricingCard
          recurrence="month"
          name="Free"
          description="Everything you need to get started with 10,500 free MAU. No setup fees, monthly fees, or hidden fees."
          price={0}
          reccurence="forever"
          target="very small teams"
          list={[
            {
              name: "Real-time contact syncing",
            },
            {
              name: "Automatic data enrichment",
            },
            {
              name: "Up to 3 seats",
            },
          ]}
          button="Get started now"
        />
        <WebPricingCard
          recurrence="month"
          name="Plus"
          description="Advanced features to help you scale any business without limits."
          price={25}
          reccurence="month"
          target="growing teams"
          list={[
            {
              name: "Private lists",
            },
            {
              name: "Enhanced email sending",
            },
            {
              name: "No seat limits",
            },
          ]}
          button="Continue with Plus"
        />
        <WebPricingCard
          recurrence="month"
          name="Pro"
          description="For teams with more complex needs requiring the highest levels of support."
          price={59}
          reccurence="month"
          target="scaling businesses"
          list={[
            {
              name: "Fully adjustable permissions",
            },
            {
              name: "Advanced data enrichment",
            },
            {
              name: "Priority support",
            },
          ]}
          button="Continue with Pro"
        />
      </div>
    </div>
  );
}
