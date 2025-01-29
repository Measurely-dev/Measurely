'use client';

// Import required dependencies
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

/**
 * Error component to handle and display application errors
 * @param error - The error object containing error details
 * @param reset - Function to attempt recovery by re-rendering
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log any errors to console for debugging
  useEffect(() => {
    console.error(error); 
  }, [error]);

  // Render error UI with recovery option
  return (
    <div className='flex min-h-[99vh] flex-col items-start gap-3 px-2 py-8'>
      <div>
        <h2 className='text-5xl font-bold'>Oops!</h2>
        <p className='text-muted-foreground'>Something went wrong!</p>
      </div>
      <Button
        onClick={() => reset()}
      >
        Try again
      </Button>
    </div>
  );
}
