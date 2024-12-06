import type { Metadata } from "next";
import { Navbar } from "@/components/docs/navbar";
import './docs.css'

export const metadata: Metadata = {
  title: "AriaDocsLite - Template",
  description:
    "This comprehensive documentation template, crafted with Next.js and available as open-source, delivers a sleek and responsive design, tailored to meet all your project documentation requirements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      suppressHydrationWarning
    >
      <Navbar />
      <div className="sm:container mx-auto w-[88vw] h-auto">
        {children}
      </div>
    </div>
  );
}
