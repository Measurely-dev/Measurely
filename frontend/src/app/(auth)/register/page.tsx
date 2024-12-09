'use client';

import AuthForm from '@/components/website/auth';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import AuthNavbar from '@/components/website/authNavbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Register() {
  const searchParams = useSearchParams();

  const [loading, set_loading] = useState(false);

  const router = useRouter();

  return (
    <WebContainer>
      <div className='max-md:mb-[50px]'>
        <AuthNavbar href='/sign-in' button='Sign in' />
      </div>
      <ContentContainer>
        <AuthForm
          title='Create an account'
          providers={true}
          form={[
            {
              label: 'First name',
              name: 'first_name',
              default: searchParams.get('first_name') ?? '',
              placeholder: 'First name',
              type: 'text',
            },
            {
              label: 'Last name',
              name: 'last_name',
              default: searchParams.get('last_name') ?? '',
              placeholder: 'Last name',
              type: 'text',
            },
            {
              label: 'Email ',
              name: 'email',
              default: searchParams.get('email') ?? '',
              placeholder: 'Email',
              type: 'email',
            },
          ]}
          button='Create your account'
          btn_loading={loading}
          action={async (formdata) => {
            set_loading(true);

            const email = formdata.get('email');
            const first_name = formdata.get('first_name');
            const last_name = formdata.get('last_name');

            if (email === '' || first_name === '' || last_name === '') {
              toast.error('Please fill in all fields');
              set_loading(false);
              return;
            }

            fetch(process.env.NEXT_PUBLIC_API_URL + '/email-valid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                type: 1,
              }),
              credentials: 'include',
            }).then((res) => {
              if (!res.ok) {
                res.text().then((text) => {
                  toast.error(text);
                });
                set_loading(false);
              } else {
                router.push(
                  `/password?email=${email}&first_name=${first_name}&last_name=${last_name}`,
                );
              }
            });
          }}
          policies
        />
      </ContentContainer>
    </WebContainer>
  );
}
