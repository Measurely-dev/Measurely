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
      className={`flex w-full gap-12 max-sm:flex-col max-sm:gap-5 sm:items-center sm:justify-between ${props.className}`}
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
