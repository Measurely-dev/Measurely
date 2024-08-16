// Empty wrapper component
export default function Empty(props: { children: any; className?: string }) {
  return (
    <div
      className={`flex h-96 flex-col items-center justify-center gap-4 rounded-[16px] border border-dashed border-input bg-input/20 text-lg font-medium text-secondary ${props.className}`}
    >
      {props.children}
    </div>
  );
}
