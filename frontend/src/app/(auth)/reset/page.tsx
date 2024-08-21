'use client';

import AuthForm from '@/components/forms/auth';
import WebContainer from '@/components/website/containers/container';
import ContentContainer from '@/components/website/containers/content';
import AuthNavbar from '@/components/website/layout/authNav/navbar';
import { useState } from 'react';

export default function PasswordReset() {
  const [view, set_view] = useState(6); // 0 : email input, 1 : sent email , 2 : password input, 3 : fail, 5 : success, 6 : loading


  return (
    <WebContainer>
      <AuthNavbar href='/sign-in' button='Sign in' />

      <ContentContainer>
        {view === 0 ? (
          <AuthForm
            title='Email'
            description='Please enter the email address linked to your account'
            providers={false}
            form={[
              {
                label: 'Email',
                placeholder: 'Email',
                name: 'email',
                type: 'email',
              },
            ]}
            button='Contine'
          />
        ) : (
          <></>
        )}

        {view === 2 ? (
          <AuthForm
            title='Password'
            description='Please choose a new password'
            providers={false}
            form={[
              {
                label: 'Password',
                placeholder: 'Password',
                name: 'password',
                type: 'password',
              },
              {
                label: 'Password',
                placeholder: 'Password',
                name: 'retyped_password',
                type: 'password',
              },
            ]}
            button='Reset'
          />
        ) : (
          <></>
        )}
        <div className='flex h-screen w-full items-center justify-center'>
          <div className='flex w-fit flex-col gap-[10px]'>
            {view === 1 ? (
              <>
                <div className='text-base font-semibold'>Check your email</div>
                <div className='mt-[10px] text-sm'>
                  We emailed a magic link to{' '}
                  <span className='font-semibold'>
                    unkown@mail.com
                  </span>
                  .
                  <br />
                  Proceed by opening the link.
                </div>
              </>
            ) : (
              <></>
            )}

            {view === 3 ? (
              <>
                <div className='text-base font-semibold'>
                  Failed to reset your password
                </div>
                <div className='mt-[10px] text-sm'>
                  the link might be invalid or expired
                </div>
              </>
            ) : (
              <></>
            )}

            {view === 5 ? (
              <>
                <div className='text-base font-semibold'>
                  Your password has been reset
                </div>
                <div className='mt-[10px] text-sm'>
                  You can now sign in with your new password
                </div>
              </>
            ) : (
              <></>
            )}

            {view === 6 ? 'LOADING...' : <></>}

            {view === 1 || view === 3 || view === 5 ? (
              <div className='mt-[10px] text-sm'>
                Need help?{' '}
                <span className='cursor-pointer font-semibold'>
                  Contact support
                </span>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </ContentContainer>
    </WebContainer>
  );
}
