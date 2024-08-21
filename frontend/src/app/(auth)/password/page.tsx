'use client';

import AuthForm from '@/components/forms/auth';
import WebContainer from '@/components/website/containers/container';
import ContentContainer from '@/components/website/containers/content';
import AuthNavbar from '@/components/website/layout/authNav/navbar';

export default function Password() {

  return (
    <WebContainer>
      <AuthNavbar href={`/register`} button='Back' />
      <ContentContainer>
        <AuthForm
          title='Choose your password'
          providers={false}
          form={[
            {
              label: 'Password',
              placeholder: 'Password',
              name: 'password',
              type: 'password',
            },
            {
              label: 'Retype password',
              placeholder: 'Password',
              name: 'retyped_password',
              type: 'password',
            },
          ]}
          button='Continue'
        />
      </ContentContainer>
    </WebContainer>
  );
}
