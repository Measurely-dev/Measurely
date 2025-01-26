export default function PolicyWrapper(props: {
  children: any; // Child components to be rendered within the wrapper
  title: string; // Title of the policy
  updatedDate: string; // Effective date of the policy
  terms: JSX.Element; // List of terms or summary points
}) {
  return (
    // Main container for the policy wrapper
    <div className='flex min-h-screen flex-col items-center'>
      {/* Inner container for the policy content */}
      <div className='flex w-full flex-col gap-4 text-primary'>
        {/* Policy title */}
        <h1 className='text-4xl'>{props.title}</h1>

        {/* Effective date of the policy */}
        <div className='text-lg text-muted-foreground'>
          Effective date: {props.updatedDate}
        </div>

        {/* Summary section heading */}
        <h2 className='mb-2'>Summary</h2>

        {/* Summary description */}
        <p>
          We've prepared a summary of key points regarding the {props.title} of
          our platform to ensure clarity and transparency.{' '}
        </p>

        {/* List of terms or summary points */}
        <ol className='text-md flex w-full list-disc flex-col gap-4 rounded-xl border border-blue-500/50 bg-blue-500/10 p-6 px-10 text-blue-500'>
          {props.terms}
        </ol>

        {/* Container for additional content (children) */}
        <div className='mb-20 mt-5 w-full'>{props.children}</div>
      </div>
    </div>
  );
}
