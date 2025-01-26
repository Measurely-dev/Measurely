
// Import required components and hooks
import AuthForm from '@/components/website/auth-form';
import Container from '@/components/website/container';
import Content from '@/components/website/content';
import SemiNavbar from '@/components/website/semi-navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SignIn() {
  // Initialize hooks and state
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle URL parameters for showing toast notifications
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
    if (params.get('warning') !== null) {
      setTimeout(() => {
        toast.warning(params.get('warning') as string);
      });
    }
  }, [params]);

  // Set page metadata
  useEffect(() => {
    document.title = 'Sign In | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Sign in to your Measurely account to track your metrics and analyze your data.',
      );
    }
  }, []);

  return (
    <Container className='min-h-[800px]'>
      <div className='mb-[150px]'>
        <SemiNavbar href='/waitlist' button='Join waitlist' />
      </div>
      <Content className='pb-20'>
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
              type: 'password-normal',
            },
          ]}
          button='Sign in'
          forgot_password
          btn_loading={loading}
          action={(form) => {
            setLoading(true);

            // Get and sanitize form input values
            const password = form.get('password')?.toString().trim();
            const email = form.get('email')?.toString().trim().toLowerCase();

            // Validate form inputs
            if (password === '' || email === '') {
              toast.error('Please enter email and password');
              setLoading(false);
              return;
            }

            // Make login API request
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
                // Clear storage and redirect on successful login
                localStorage.clear();
                sessionStorage.clear();
                router.push('/dashboard');
              }
            });
          }}
        />
      </Content>
    </Container>
  );
}
