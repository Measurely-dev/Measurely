export default function PolicyWrapper(props: {
  children: any;
  title: string;
  updatedDate: string;
  terms: JSX.Element;
}) {
  return (
    <div className='flex min-h-screen flex-col items-center'>
      <div className='flex w-full flex-col gap-4 text-primary'>
        <h1 className='text-4xl'>{props.title}</h1>
        <div className='text-lg text-muted-foreground'>
          Effective date: {props.updatedDate}
        </div>
        <h2 className='mb-2'>Summary</h2>
        <p>
          We've prepared a summary of key points regarding the {props.title} of
          our platform to ensure clarity and transparency.{' '}
        </p>
        <ol className='text-md flex w-full list-disc flex-col gap-4 rounded-xl border border-blue-500/50 bg-blue-500/10 p-6 px-10 text-blue-500'>
          {props.terms}
        </ol>
        <div className='mb-20 mt-5 w-full'>{props.children}</div>
      </div>
    </div>
  );
}
