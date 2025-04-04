// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import LayoutClient from "./layout-client";

// Application metadata configuration for SEO and social sharing
export const metadata: Metadata = {
  // Main title and description
  title: {
    default: "Measurely - Track your metrics effectively",
    template: "%s | Measurely",
  },
  description:
    "Measurely is an intuitive dashboard that helps developers and teams track metrics efficiently, connect APIs, and analyze data with ease.",

  // OpenGraph metadata for social sharing
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

  // Twitter card metadata
  twitter: {
    card: "summary_large_image",
    site: "@getmeasurely",
    title: "Measurely - Track your metrics effectively",
    description:
      "Discover how Measurely helps developers track and analyze metrics seamlessly. Boost your data-driven decisions today!",
    images: ["https://media.measurely.dev/opengraph.png"],
  },

  // Base URL for metadata
  metadataBase: new URL("https://measurely.dev"),

  // Favicon and icon configurations
  icons: [
    {
      rel: "icon",
      type: "image/png",
      url: "/favicon-96x96.png",
      sizes: "96x96",
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "/favicon.svg",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/apple-touch-icon.png",
    },
  ],

  // Project authors
  authors: [
    { name: "zakafz", url: "https://github.com/zakafz" },
    { name: "yasthegoat", url: "https://github.com/yasthegoat" },
  ],

  // SEO keywords
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
  robots: "index, follow",
};

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" enableSystem>
          <LayoutClient>{children}</LayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
