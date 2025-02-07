import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shadow-sm shadow-black/5 items-center justify-center !outline-none !ring-0 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary border border-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-accent border text-muted-foreground hover:text-primary hover:bg-accent',
        destructiveOutline:
          'border border-red-500/50 hover:bg-destructive/15 bg-destructive/10 text-destructive dark:text-red-500',
        ghost:
          'hover:bg-accent shadow-none border border-transparent hover:border-input hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean; // Add the loading prop
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          'transition-all duration-300',
        )}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <>
            {/* <ReloadIcon className='mr-2 h-4 w-4 animate-spin' /> */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='feather feather-loader duration-[2000s] mr-2 h-4 w-4 animate-spin'
            >
              <line x1='12' y1='2' x2='12' y2='6' />
              <line x1='12' y1='18' x2='12' y2='22' />
              <line x1='4.93' y1='4.93' x2='7.76' y2='7.76' />
              <line x1='16.24' y1='16.24' x2='19.07' y2='19.07' />
              <line x1='2' y1='12' x2='6' y2='12' />
              <line x1='18' y1='12' x2='22' y2='12' />
              <line x1='4.93' y1='19.07' x2='7.76' y2='16.24' />
              <line x1='16.24' y1='7.76' x2='19.07' y2='4.93' />
            </svg>
            {props.children}
          </>
        ) : (
          props.children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
