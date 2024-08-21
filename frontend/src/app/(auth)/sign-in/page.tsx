'use client';

import AuthForm from '@/components/forms/auth';
import WebContainer from '@/components/website/containers/container';
import ContentContainer from '@/components/website/containers/content';
import AuthNavbar from '@/components/website/layout/authNav/navbar';
export default function SignIn() {
  return (
    <WebContainer>
      <AuthNavbar href='/register' button='Create an account' />
      <ContentContainer>
        <AuthForm
          title='Hey friend! Welcome back'
          providers={true}
          form={[
            {
              label: 'Email',
              name: 'email',
              placeholder: 'Email',
              type: 'text',
            },
            {
              label: 'Password',
              name: 'password',
              placeholder: 'Password',
              type: 'password',
            },
          ]}
          button='Sign in'
          forgot_password
        />
      </ContentContainer>
    </WebContainer>
  );
}
