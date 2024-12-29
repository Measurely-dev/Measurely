import { ComponentProps } from 'react';

export default function Pre({ children, ...rest }: ComponentProps<'pre'>) {
  return (
    <div className='relative my-5'>
      <div className='relative'>
        <pre {...rest}>{children}</pre>
      </div>
    </div>
  );
}
