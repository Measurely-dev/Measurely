// Import React's type for child components
import { ReactNode } from 'react';

// Dashboard container component that wraps content with consistent spacing and layout
// @param children - Child components to be rendered inside the container 
// @param className - Optional additional CSS classes to apply
export default function DashboardContentContainer(props: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      // Apply base container styles with top margin, flex column layout,
      // bottom/right padding, and any additional className passed in
      className={`mt-[65px] flex flex-col pb-[15px] pr-[15px] ${props.className}`}
    >
      {props.children}
    </div>
  );
}
