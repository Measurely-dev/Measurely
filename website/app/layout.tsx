import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import Image from "next/image";
import { Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { GitHubIcon } from "nextra/icons";
import { getPageMap } from "nextra/page-map";
import Logo from "../public/logos/measurely-icon.png";
import "./docs.css";
import "./globals.css";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  description: "Track metrics efficiently and analyze data with ease.",
  metadataBase: new URL("https://measurely.dev"),
  keywords: ["Docs", "Metrics", "Track", "Analytics", "KPI", "SDKs", "Event"],
  generator: "Next.js",
  applicationName: "Measurely",
  appleWebApp: {
    title: "Measurely",
  },
  title: {
    default: "Measurely - Track your metrics effectively",
    template: "%s | Measurely",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://measurely.dev",
    siteName: "Measurely",
    title: "Measurely - Track your metrics effectively",
    description:
      "Track and analyze your metrics seamlessly with Measurely. Perfect for developers and data-driven teams.",
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
    "msapplication-TileColor": "#fff",
  },
  twitter: {
    site: "https://measurely.dev",
  },
  alternates: {
    canonical: "./",
  },
};

const navbar = (
  <Navbar
    logoLink={"/"}
    logo={
      <div className="flex flex-row items-center gap-2">
        <Image
          width={30}
          height={30}
          src={Logo}
          className="min-w-[30px] min-h-[30px]"
          alt="Logo"
        />
        <span className="text-lg font-semibold max-lg:hidden">Measurely</span>
      </div>
    }
    projectLink="https://github.com/measurely-dev/measurely"
    projectIcon={<GitHubIcon className="size-6 max-sm:hidden" />}
  >
    {<Actions type="waitlist" />}
  </Navbar>
);

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
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Measurely-dev/Measurely/tree/main/website"
          footer={<Footer border bg="secondary" type="default" />}
          darkMode={false}
          nextThemes={{ defaultTheme: "light" }}
          sidebar={{ autoCollapse: true }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}

// Component to render authentication-specific action buttons
function Actions(props: { type: "default" | "waitlist" | "logged" }) {
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
      // Logged in state - Dashboard button
      case "logged":
        return (
          <>
            <Link
              href="https://app.measurely.dev/dashboard"
              className="max-md:w-full"
            >
              <Button
                variant="default"
                size={"sm"}
                className="h-9 rounded-xl border-primary px-4 py-[10px] font-medium max-md:w-full"
              >
                Dashboard
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
