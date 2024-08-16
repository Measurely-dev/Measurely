'use client';

import {
  githubAuthAction,
  googleAuthAction,
} from '@/backend/actions/auth/providers';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function AuthForm(props: {
  title: string;
  description?: string;
  providers: boolean;
  form: Array<any>;
  button: string;
  action: (formdata: FormData) => void;
  forgot_password?: boolean;
  policies?: boolean;
  error?: string;
  btn_loading?: boolean;
}) {
  const providers = [
    {
      name: 'Google',
      action: googleAuthAction,
      svg: (
        <>
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
              fill='#4285F4'
              d='M30.363 16.337c0-.987-.088-1.925-.238-2.837H16v5.637h8.087c-.362 1.85-1.424 3.413-3 4.476v3.75h4.826c2.825-2.613 4.45-6.463 4.45-11.026Z'
            ></path>{' '}
            <path
              fill='#34A853'
              d='M16 31c4.05 0 7.438-1.35 9.913-3.637l-4.826-3.75c-1.35.9-3.062 1.45-5.087 1.45-3.912 0-7.225-2.638-8.413-6.2H2.612v3.862C5.075 27.625 10.137 31 16 31Z'
            ></path>{' '}
            <path
              fill='#FBBC05'
              d='M7.588 18.863A8.704 8.704 0 0 1 7.112 16c0-1 .175-1.963.476-2.863V9.275H2.612a14.826 14.826 0 0 0 0 13.45l4.976-3.863Z'
            ></path>{' '}
            <path
              fill='#EA4335'
              d='M16 6.938c2.212 0 4.188.762 5.75 2.25l4.275-4.276C23.438 2.487 20.05 1 16 1 10.137 1 5.075 4.375 2.612 9.275l4.975 3.862c1.188-3.562 4.5-6.2 8.413-6.2Z'
            ></path>
          </svg>
        </>
      ),
    },
    {
      name: 'Github',
      action: githubAuthAction,
      svg: (
        <>
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
        </>
      ),
    },
  ];
  return (
    <form
      className='flex min-h-screen w-full items-center justify-center'
      onSubmit={(event) => {
        event.preventDefault();
        const formdata = new FormData(event.currentTarget);
        props.action(formdata);
      }}
    >
      <div className='flex w-[500px] flex-col gap-[10px] rounded-[30px] bg-accent p-[30px]'>
        <div
          className={`${props.description ? '' : 'mb-5'} text-2xl font-medium`}
        >
          {props.title}
        </div>
        {props.description ? (
          <div className='mb-5 text-sm'>{props.description}</div>
        ) : (
          <></>
        )}
        {props.providers ? (
          <div className='flex flex-col gap-[10px]'>
            {providers.map((provider, i) => {
              return (
                <div
                  key={i}
                  className='flex w-full cursor-pointer items-center justify-center gap-[10px] rounded-[12px] bg-background py-[10px] text-[14px] font-medium transition-all hover:bg-background/75'
                  onClick={() => provider.action()}
                >
                  {provider.svg}
                  Continue with {provider.name}
                </div>
              );
            })}
            <div className='mt-[20px] flex w-full items-center justify-center text-sm text-secondary'>
              Or
            </div>
          </div>
        ) : (
          <></>
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
                  className='rounded-[6px] bg-background py-2'
                />
              </div>
            );
          })}
          <Button
            className='rounded-[8px]'
            type='submit'
            loading={props.btn_loading}
          >
            {props.button}
          </Button>
          {props.forgot_password ? (
            <Link className='text-sm text-secondary' href={'/reset'}>
              {' '}
              Forgot password ?{' '}
            </Link>
          ) : (
            <></>
          )}

          {props.error !== undefined ? (
            <div className='text-sm text-secondary'>{props.error}</div>
          ) : (
            <></>
          )}
        </div>
        {props.policies ? (
          <div className='mt-5 flex flex-col items-center justify-center gap-2 text-center'>
            <div className='text-sm'>
              By continuing, you agree to our policies
            </div>
            <div className='flex items-center gap-2 text-center text-sm font-semibold'>
              <Link href='/'>Terms of use</Link>
              <div>•</div>
              <Link href='/'>Privacy policy</Link>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </form>
  );
}
