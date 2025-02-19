// Import the wrapper component for dashboard layouts
import DashboardWrapper from "./wrapper";

// DashboardContentLayout component: Wraps content with the dashboard layout
export default function DashboardContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
