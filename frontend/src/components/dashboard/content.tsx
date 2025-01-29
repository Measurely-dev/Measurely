// Import React's type for components that can contain child elements
import { ReactNode } from 'react';

// DashboardContent component serves as a container for dashboard content
// Props:
// - children: React components to be rendered inside the dashboard container
export default function DashboardContent(props: { children: ReactNode }) {
  return (
    // Container div with full viewport height/width and flex column layout
    // Top padding of 15px and relative positioning for child element placement
    <div className='relative flex h-screen max-h-screen w-full flex-col pt-[15px]'>
      {props.children}
    </div>
  );
}
