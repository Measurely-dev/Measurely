'use client';

import AuthForm from '@/components/forms/auth';
import WebContainer from '@/components/website/containers/container';
import ContentContainer from '@/components/website/containers/content';
import AuthNavbar from '@/components/website/layout/authNav/navbar';

export default function Register() {
  return (
    <WebContainer>
      <AuthNavbar href='/sign-in' button='Sign in' />
      <ContentContainer>
        <AuthForm
          title='Create your account'
          providers={true}
          form={[
            {
              label: 'First name',
              name: 'first_name',
              placeholder: 'First name',
              type: 'text',
            },
            {
              label: 'Last name',
              name: 'last_name',
              placeholder: 'Last name',
              type: 'text',
            },
            {
              label: 'Email ',
              name: 'email',
              placeholder: 'Email',
              type: 'text',
            },
          ]}
          button='Create your account'
          policies
        />
      </ContentContainer>
    </WebContainer>
  );
}
