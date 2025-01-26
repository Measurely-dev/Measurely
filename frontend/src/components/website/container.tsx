import { ReactNode } from 'react';

export default function Container(props: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${props.className}`}>{props.children}</div>
  );
}
