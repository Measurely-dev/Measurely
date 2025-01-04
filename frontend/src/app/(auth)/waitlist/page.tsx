'use client';
import AuthForm from '@/components/website/auth';
import AuthNavbar from '@/components/website/auth-navbar';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import React from 'react';
import { toast } from 'sonner';

const Waitlist = () => {
  return (
    <WebContainer className='min-h-[800px]'>
      <div className='mb-[150px]'>
        <AuthNavbar href='/sign-in' button='Sign in' />
      </div>
      <ContentContainer>
        <AuthForm
          title='Join our waitlist'
          description='As soon as Measurely release, you will be notified.'
          providers={false}
          form={[
            {
              label: 'First name',
              name: 'email',
              placeholder: 'Email',
              type: 'email',
            },
            {
              label: 'Email',
              name: 'email',
              placeholder: 'john.doe@exemple.com',
              type: 'email',
            },
          ]}
          button='Join waitlist'
          action={(form) => {
            toast.success('Succesfully joined waitlist');
          }}
          policies
        />
      </ContentContainer>
    </WebContainer>
  );
};

export default Waitlist;
