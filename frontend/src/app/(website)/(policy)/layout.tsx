import type { Metadata } from 'next';
import '../../../styles/markdown.css';

// Define metadata for SEO and page headers
export const metadata: Metadata = {
  title: 'Policy | Measurely', // Page title for policy-related pages
};

// RootLayout component for policy pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // Children components to be rendered within the layout
}>) {
  return (
    // Main container for the policy layout
    <div className="policy flex flex-col items-center overflow-x-hidden">
      {/* Inner container to ensure full screen height and width */}
      <div className="min-h-screen w-screen">{children}</div>
    </div>
  );
}