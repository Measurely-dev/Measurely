'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { providers } from '@/providers';


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
            {providers.map((provider : any) => {
              return (
                <div
                  className='curso-pointer flex w-full cursor-pointer items-center justify-center gap-[10px] rounded-[12px] bg-background py-[10px] text-[14px] font-medium transition-all hover:bg-background/75'
                  onClick={() => {
                    router.push(
                      `${process.env.NEXT_PUBLIC_API_URL}/oauth/${provider.name.toLowerCase()}?state=auth.`,
                    );
                  }}
                >
                  {provider.logo}
                  Continue with {provider.name}
                </div>
              );
            })}
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
