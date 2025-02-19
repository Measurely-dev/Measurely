import DashboardContentClient from "./dashboard-content-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Welcome to your Measurely Dashboard. Manage and track your metrics, connect APIs, and analyze data all in one place. Get real-time insights to make better data-driven decisions for your projects and teams.",
};
export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div suppressHydrationWarning>
      <DashboardContentClient>{children}</DashboardContentClient>
    </div>
  );
}
