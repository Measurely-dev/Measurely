'use client';

import AuthForm from '@/components/website/auth';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import AuthNavbar from '@/components/website/auth-navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SignIn() {
  const params = useSearchParams();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get('error') !== null) {
      setTimeout(() => {
        toast.error(params.get('error') as string);
      });
    }
    if (params.get('success') !== null) {
      setTimeout(() => {
        toast.success(params.get('success') as string);
      });
    }
  }, [params]);

  return (
    <WebContainer>
      <div className='max-md:mb-[20px]'>
        <AuthNavbar href='/register' button='Create an account' />
      </div>
      <ContentContainer>
        <AuthForm
          title='Hey friend! Welcome back'
          providers={true}
          form={[
            {
              label: 'Email',
              name: 'email',
              placeholder: 'Email',
              type: 'email',
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
          btn_loading={loading}
          action={(form) => {
            setLoading(true);

            const password = form.get('password');
            const email = form.get('email');

            if (password === '' || email === '') {
              toast.error('Please enter email and password');
              setLoading(false);
              return;
            }

            console.log(process.env.NEXT_PUBLIC_API_URL + `/login`);
            fetch(process.env.NEXT_PUBLIC_API_URL + `/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                email: email,
                password: password,
              }),
            }).then((res) => {
              if (!res.ok) {
                res.text().then((text) => {
                  toast.error(text);
                });
                setLoading(false);
              } else {
                router.push('/dashboard');
              }
            });
          }}
        />
      </ContentContainer>
    </WebContainer>
  );
}
