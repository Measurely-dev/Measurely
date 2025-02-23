import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { Layout, Navbar } from "nextra-theme-docs";
import { Head, Search } from "nextra/components";
import { GitHubIcon } from "nextra/icons";
import { getPageMap } from "nextra/page-map";
import "./docs.css";
import "./globals.css";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LogoSvg from "@/components/global/logo-svg";

export const metadata: Metadata = {
  description:
    "Open-source analytics platform for developers to track metrics, monitor user behavior, and gain actionable insights.",
  metadataBase: new URL("https://measurely.dev"),
  keywords: [
    "Open-source analytics",
    "Web analytics tools",
    "User behavior tracking",
    "Event tracking software",
    "Real-time analytics",
    "Data visualization",
    "KPI monitoring",
    "Developer analytics SDKs",
    "Customizable dashboards",
    "Self-hosted analytics",
    "Privacy-focused analytics",
    "Product analytics",
    "Conversion rate optimization",
    "Funnel analysis",
    "Retention analysis",
    "Cohort analysis",
    "A/B testing tools",
    "Session recording",
    "Heatmaps",
    "User segmentation",
    "Google Analytics",
    "PostHog",
    "Matomo",
    "Piwik",
    "Mixpanel",
    "Amplitude",
    "Open Web Analytics",
    "OWA",
    "Plausible",
    "Grofana",
    "Analytics",
    "Dashboard",
    "Analytics Dashboard",
  ],
  generator: "Next.js",
  applicationName: "Measurely",
  appleWebApp: {
    title: "Measurely",
  },
  title: {
    default: "Measurely - Open-Source Analytics for Developers",
    template: "%s | Measurely",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://measurely.dev",
    siteName: "Measurely",
    title: "Measurely - Open-Source Analytics for Developers",
    description:
      "Monitor user behavior and gain actionable insights with Measurely's open-source analytics platform, designed for developers and data-driven teams.",
    images: [
      {
        url: "https://media.measurely.dev/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Measurely Dashboard Preview",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#ffffff",
  },
  twitter: {
    site: "@measurely",
    card: "summary_large_image",
    title: "Measurely - Open-Source Analytics for Developers",
    description:
      "Track metrics and analyze data seamlessly with Measurely's developer-friendly analytics platform.",
    images: ["https://media.measurely.dev/twitter-card.png"],
  },
  alternates: {
    canonical: "https://measurely.dev",
  },
};

function NavbarComponent() {
  return (
    <Navbar
      logoLink={"/"}
      logo={
        <div className="flex flex-row items-center gap-2">
          <LogoSvg className="size-9 min-w-9 min-h-9 dark:invert" />
          <span className="text-lg font-semibold max-lg:hidden">Measurely</span>
        </div>
      }
      projectLink="https://github.com/measurely-dev/measurely"
      projectIcon={<GitHubIcon className="size-6 max-sm:hidden" />}
    >
      <Actions type="waitlist" />
    </Navbar>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body className={GeistSans.className + " " + GeistMono.variable}>
        <Layout
          navbar={<NavbarComponent />}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Measurely-dev/Measurely/tree/main/website"
          footer={<Footer border bg="secondary" type="waitlist" />}
          sidebar={{ autoCollapse: true }}
          search={<Search placeholder="Search Measurely..." />}
          darkMode={false}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}

// Component to render authentication-specific action buttons
function Actions(props: { type: "default" | "waitlist" }) {
  const render = () => {
    switch (props.type) {
      // Default state - Sign in and Get started buttons
      case "default":
        return (
          <>
            <Link href="https://app.measurely.dev/sign-in">
              <Button
                variant="outline"
                size={"sm"}
                className="h-9 rounded-xl px-4 py-[10px] font-medium max-md:w-full"
              >
                Sign in
              </Button>
            </Link>
            <Link href="https://app.measurely.dev/register">
              <Button
                variant="default"
                size={"sm"}
                className="h-9 rounded-xl border-primary px-4 py-[10px] font-medium max-md:w-full"
              >
                Get started
              </Button>
            </Link>
          </>
        );
      // Waitlist state - Sign in and Join waitlist buttons
      case "waitlist":
        return (
          <>
            <Link href="https://app.measurely.dev/sign-in">
              <Button
                variant="outline"
                size={"sm"}
                className="h-9 rounded-xl px-4 py-[10px] font-medium max-md:w-full"
              >
                Sign in
              </Button>
            </Link>
            <Link href="https://app.measurely.dev/waitlist">
              <Button
                variant="default"
                size={"sm"}
                className="h-9 rounded-xl border-primary px-4 py-[10px] font-medium max-md:w-full"
              >
                Join waitlist
              </Button>
            </Link>
          </>
        );
    }
  };
  return <div className="flex flex-row gap-2">{render()}</div>;
}
