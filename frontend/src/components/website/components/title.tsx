export default function WebTitle(props: {
  className?: string;
  subtitle: string;
  title: string;
  titleClassName?: string;
}) {
  return (
    <div className={`flex flex-col gap-[10px] text-center ${props.className}`}>
      <div className='text-center text-lg font-medium'>✧ {props.subtitle}</div>
      <div
        className={`text-center text-[40px] font-medium max-md:text-[32px] max-sm:text-[24px] ${props.titleClassName}`}
      >
        {props.title}
      </div>
    </div>
  );
}
