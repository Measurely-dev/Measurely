'use client';

import AuthForm from '@/components/forms/auth';
import WebContainer from '@/components/website/containers/container';
import ContentContainer from '@/components/website/containers/content';
import AuthNavbar from '@/components/website/layout/authNav/navbar';
import { useState } from 'react';

export default function Waitlist() {
  const [view, set_view] = useState(0); // 0 : waitlist input, 1 : sucess view
  return (
    <WebContainer>
      <AuthNavbar href='/' button='Back to home' />
      <ContentContainer>
        {view === 0 ? (
          <AuthForm
            title='Apply for early access!'
            description='We are still fine tuning the product and would love your help. Join our waitlist to help contribute to the future of presentations.'
            providers={false}
            form={[
              {
                label: 'First name',
                placeholder: 'First name',
                name: 'first_name',
                type: 'text',
              },
              {
                label: 'Last name',
                placeholder: 'Last name',
                name: 'last_name',
                type: 'text',
              },
              {
                label: 'Email ',
                placeholder: 'Email',
                name: 'email',
                type: 'email',
              },
            ]}
            action={(form) => {
              
            }}
            button='Get waitlisted'
            policies
          />
        ) : (
          <></>
        )}

        <div className='flex h-screen w-full items-center justify-center'>
          <div className='flex w-fit flex-col gap-[10px]'>
            {view === 1 ? (
              <>
                <div className='text-base font-semibold'>
                  Thank you for joining the waitlist
                </div>
                <div className='mt-[10px] text-sm'>
                  Be the first to experience Zway
                </div>
                <div className='mt-[10px] text-sm'>
                  Need help?{' '}
                  <span className='cursor-pointer font-semibold'>
                    Contact support
                  </span>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </ContentContainer>
    </WebContainer>
  );
}
