import { ReactNode } from 'react';

export default function WebButton(props: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`paint relative flex w-fit cursor-pointer flex-row items-center justify-center overflow-hidden rounded-lg border border-black bg-[transparent] bg-black px-3 py-1.5 [background:radial-gradient(90%_70%_at_50%_30%,_rgba(255,_255,_255,_0.3),_rgba(255,_255,_255,_0)),_#09090b] ${props.className}`}
    >
      <div className='gradient-mask-l-50-d absolute top-0 h-[1px] w-full bg-zinc-500 opacity-90' />
      <div className='font-inter relative text-left text-sm font-medium leading-[20px] text-white'>
        {props.children}
      </div>
    </button>
  );
}
