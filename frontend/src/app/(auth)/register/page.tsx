'use client';

import AuthForm from '@/components/website/auth';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import AuthNavbar from '@/components/website/auth-navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Register() {
  const searchParams = useSearchParams();

  const [loading, set_loading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    document.title = 'Register | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Create a Measurely account to start tracking your metrics and gain insights for your projects and teams.',
      );
    }

    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      fetch(
        `https://api.measurely.dev/event/${process.env.NEXT_PUBLIC_MEASURELY_API_KEY}/57d2421b-d6d3-4af7-8f09-6a50d7afec7a`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: 1 }),
        },
      );
    }
  }, []);
  return (
    <WebContainer>
      <div className='mb-[150px]'>
        <AuthNavbar href='/sign-in' button='Sign in' />
      </div>
      <ContentContainer className='pb-[100px]'>
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

            const email = formdata
              .get('email')
              ?.toString()
              .trim()
              .toLowerCase();
            const first_name = formdata
              .get('first_name')
              ?.toString()
              .trimStart()
              .toLowerCase();
            const last_name = formdata
              .get('last_name')
              ?.toString()
              .trimStart()
              .toLowerCase();

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
