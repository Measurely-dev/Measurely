'use client';

import AuthForm from '@/components/website/auth';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import AuthNavbar from '@/components/website/auth-navbar';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Password() {
  const searchParams = useSearchParams();

  const [loading, set_loading] = useState(false);
  const [back_query, set_back_query] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (
      searchParams.get('first_name') !== null &&
      searchParams.get('last_name') !== null &&
      searchParams.get('email') !== null
    ) {
      set_back_query(
        `?first_name=${searchParams.get(
          'first_name',
        )}&last_name=${searchParams.get('last_name')}&email=${searchParams.get(
          'email',
        )}`,
      );
    } else {
      redirect('/register');
    }
  }, [searchParams]);

  useEffect(() => {
    document.title = 'Create Password | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Create a secure password for your Measurely account to start tracking your metrics and analyzing your data.',
      );
    }
  }, []);

  return (
    <WebContainer>
      <AuthNavbar href={`/register${back_query}`} button='Back' />
      <ContentContainer type='page'>
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
          btn_loading={loading}
          action={async (formdata) => {
            set_loading(true);

            const email = searchParams
              .get('email')
              ?.toString()
              .trim()
              .toLowerCase();
            const first_name = searchParams
              .get('first_name')
              ?.toString()
              .trim();
            const last_name = searchParams.get('last_name')?.toString().trim();
            const password = formdata.get('password')?.toString().trim();
            const retype = formdata.get('retyped_password')?.toString().trim();

            if (
              password === '' ||
              retype === '' ||
              email === '' ||
              first_name === '' ||
              last_name === ''
            ) {
              toast.error('Please fill in all fields');
              set_loading(false);
              return;
            }

            if (password !== retype) {
              toast.error('The passwords must be the same');
              set_loading(false);
              return;
            }

            fetch(process.env.NEXT_PUBLIC_API_URL + '/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                email: email,
                firstname: first_name,
                lastname: last_name,
                password: password,
              }),
            }).then((res) => {
              if (!res.ok) {
                res.text().then((text) => {
                  toast.error(text);
                });
                set_loading(false);
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
