import { ReactNode } from 'react';

export default function DashboardContentContainer(props: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mt-[65px] flex flex-col pb-[15px] pr-[15px] ${props.className}`}
    >
      {props.children}
    </div>
  );
}
