// Import React's component props type utility
import { ComponentProps } from 'react';

/**
 * Pre component wraps content in a preformatted text block with styling
 * @param children - Content to be rendered inside the pre element
 * @param rest - Additional HTML pre element props spread onto the pre element
 */
export default function Pre({ children, ...rest }: ComponentProps<'pre'>) {
  return (
    <div className='relative my-5'>
      <div className='relative'>
        <pre {...rest}>{children}</pre>
      </div>
    </div>
  );
}
