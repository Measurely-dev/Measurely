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
    url: "./",
    siteName: "Measurely",
    locale: "en_US",
    type: "website",
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
    chatLink="https://twitter.com/getmeasurely"
    chatIcon={
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="24"
        height="24"
        viewBox="0 0 50 50"
      >
        <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z"></path>
      </svg>
    }
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
          docsRepositoryBase="https://github.com/Measurely-dev/Measurely/tree/main/docs"
          footer={footer}
          darkMode={false}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
