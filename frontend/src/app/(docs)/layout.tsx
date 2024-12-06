import type { Metadata } from "next";
import { Navbar } from "@/components/docs/navbar";
import './docs.css'
import { headers } from "next/headers";

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

  const headersList = headers();
  const is_authentificated = headersList.get('is-authentificated');
  return (
    <>
      <Navbar is_authenticated={is_authentificated}/>
      <div className="sm:container mx-auto w-[88vw] h-auto">
        {children}
      </div>
    </>
  );
}
