export default function Header(props: {
  title: string;
  description?: string | null;
  children?: any;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div
      className={`flex w-full items-center justify-between gap-12 ${props.className}`}
    >
      <div className='flex flex-col gap-[5px]'>
        <div className={`text-2xl font-medium ${props.titleClassName}`}>
          {props.title}
        </div>
        {props.description ? (
          <div
            className={`text-sm text-secondary ${props.descriptionClassName}`}
          >
            {props.description}
          </div>
        ) : (
          <></>
        )}
      </div>
      {props.children}
    </div>
  );
}
