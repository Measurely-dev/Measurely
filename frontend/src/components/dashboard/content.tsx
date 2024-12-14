import { ReactNode } from 'react';

export default function DashboardContent(props: { children: ReactNode }) {
  return (
    <div className='relative flex h-screen max-h-screen w-full flex-col pt-[15px]'>
      {props.children}
    </div>
  );
}
