import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "./globals.css";
import "./docs.css";
import Image from "next/image";
import Logo from "../public/logos/measurely-icon.png";
import { GitHubIcon } from "nextra/icons";
import { Metadata } from "next";
export const metadata: Metadata = {
  description: "Track metrics efficiently and analyze data with ease.",
  metadataBase: new URL("https://content.measurely.dev"),
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
    url: "https://content.measurely.dev",
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
    site: "https://content.measurely.dev",
  },
  alternates: {
    canonical: "./",
  },
};

const navbar = (
  <Navbar
    logoLink={"https://measurely.dev"}
    logo={
      <div className="flex flex-row items-center gap-2">
        <Image width={30} height={30} src={Logo} alt="Logo" />
        <span className="text-lg font-semibold">Measurely</span>
      </div>
    }
    projectLink="https://github.com/measurely-dev/measurely"
    projectIcon={<GitHubIcon className="size-6" />}
  />
);
const footer = (
  <Footer className="text-sm">
    © {new Date().getFullYear()} Measurely-dev.
  </Footer>
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Measurely-dev/Measurely/tree/main/content"
          footer={footer}
          darkMode={false}
          nextThemes={{ defaultTheme: "light" }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
