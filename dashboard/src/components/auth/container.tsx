import { ReactNode } from 'react';

/**
 * A flexible container component that wraps child elements in a flex column layout
 * 
 * @param props.children - React child elements to be rendered inside the container
 * @param props.className - Optional CSS class names to be applied to the container
 */
export default function Container(props: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${props.className}`}>{props.children}</div>
  );
}