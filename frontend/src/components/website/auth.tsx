'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm(props: {
  title: string;
  description?: string;
  providers: boolean;
  form: Array<any>;
  button: string;
  forgot_password?: boolean;
  policies?: boolean;
  btn_loading?: boolean;
  action: (formdata: FormData) => void;
}) {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(true);
  const ref = useRef<HTMLFormElement | null>(null);

  // Function to check if any form fields are empty
  function checkFormValidity() {
    const formElement = ref.current;
    if (!formElement) return true;
    const formData = new FormData(formElement);

    for (let i = 0; i < props.form.length; i++) {
      if (!formData.get(props.form[i].name)) {
        return true;
      }
    }
    return false;
  }

  // Update the disabled state whenever the form changes
  useEffect(() => {
    const formElement = ref.current;
    if (!formElement) return;

    const handleInputChange = () => {
      setIsDisabled(checkFormValidity());
    };

    // Add event listeners to form inputs
    const inputs = formElement.querySelectorAll('input');
    inputs.forEach((input) => {
      input.addEventListener('input', handleInputChange);
    });

    // Remove event listeners when the component unmounts
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('input', handleInputChange);
      });
    };
  }, []);

  return (
    <form
      className='flex min-h-screen w-full items-center justify-center'
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        props.action(formData);
      }}
    >
      <div className='flex w-[500px] flex-col gap-[10px] rounded-[30px] bg-accent p-[30px]'>
        <div
          className={`${props.description ? '' : 'mb-5'} text-2xl font-medium`}
        >
          {props.title}
        </div>
        {props.description && (
          <div className='mb-5 text-sm'>{props.description}</div>
        )}

        {props.providers && (
          <div className='flex flex-col gap-[10px]'>
            <div
              className='curso-pointer flex w-full cursor-pointer items-center justify-center gap-[10px] rounded-[12px] bg-background py-[10px] text-[14px] font-medium transition-all hover:bg-background/75'
              onClick={() => {
                router.push(
                  process.env.NEXT_PUBLIC_API_URL + '/use-github?type=0',
                );
              }}
            >
              <svg
                className='size-6'
                fill='none'
                aria-hidden='true'
                focusable='false'
                viewBox='0 0 32 32'
                xmlns='http://www.w3.org/2000/svg'
              >
                {' '}
                <path
                  fill='#000'
                  d='M16 2C8.27 2 2 8.268 2 16c0 6.186 4.011 11.433 9.575 13.285.699.13.925-.305.925-.673v-2.607c-3.894.847-4.705-1.652-4.705-1.652-.637-1.618-1.555-2.048-1.555-2.048-1.27-.87.096-.85.096-.85 1.406.097 2.146 1.442 2.146 1.442 1.248 2.14 3.275 1.522 4.074 1.164.125-.905.488-1.523.889-1.872-3.11-.356-6.378-1.556-6.378-6.92 0-1.529.547-2.777 1.442-3.757-.145-.354-.624-1.778.136-3.706 0 0 1.176-.375 3.851 1.436A13.427 13.427 0 0 1 16 8.77c1.19.006 2.388.161 3.507.472 2.673-1.811 3.846-1.436 3.846-1.436.762 1.929.283 3.353.138 3.706.899.98 1.441 2.23 1.441 3.758 0 5.377-3.275 6.561-6.392 6.907.502.434.96 1.286.96 2.593v3.842c0 .372.224.81.934.672C25.994 27.43 30 22.184 30 16c0-7.732-6.268-14-14-14Z'
                ></path>
              </svg>
              Continue with Github
            </div>
            <div className='curso-pointer flex w-full cursor-pointer items-center justify-center gap-[10px] rounded-[12px] bg-background py-[10px] text-[14px] font-medium transition-all hover:bg-background/75'>
              <svg
                className='size-5'
                viewBox='-3 0 262 262'
                xmlns='http://www.w3.org/2000/svg'
                preserveAspectRatio='xMidYMid'
              >
                <path
                  d='M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027'
                  fill='#4285F4'
                />
                <path
                  d='M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1'
                  fill='#34A853'
                />
                <path
                  d='M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782'
                  fill='#FBBC05'
                />
                <path
                  d='M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251'
                  fill='#EB4335'
                />
              </svg>
              Continue with Google
            </div>
            <div className='mt-[20px] flex w-full items-center justify-center text-sm text-secondary'>
              Or
            </div>
          </div>
        )}

        <div className='flex flex-col gap-[20px]'>
          {props.form.map((input, i) => {
            return (
              <div className='flex flex-col gap-[5px]' key={i}>
                <Label className='text-sm'>{input.label}</Label>
                <Input
                  type={input.type}
                  name={input.name}
                  defaultValue={input.default}
                  placeholder={input.placeholder}
                  className='rounded-[8px] bg-background py-2'
                />
              </div>
            );
          })}
          <Button
            className='rounded-[8px]'
            type='submit'
            disabled={isDisabled || props.btn_loading}
            loading={props.btn_loading}
          >
            {props.button}
          </Button>

          {props.forgot_password && (
            <Link className='text-sm text-secondary' href={'/reset'}>
              Forgot password?
            </Link>
          )}
        </div>

        {props.policies && (
          <div className='mt-5 flex flex-col items-center justify-center gap-2 text-center'>
            <div className='text-sm'>
              By continuing, you agree to our policies
            </div>
            <div className='flex items-center gap-2 text-center text-sm font-semibold'>
              <Link href='/terms'>Terms of use</Link>
              <div>•</div>
              <Link href='/privacy'>Privacy policy</Link>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
