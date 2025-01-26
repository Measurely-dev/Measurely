'use client';

// Import required components and hooks
import Container from '@/components/website/container';
import Content from '@/components/website/content';
import SemiNavbar from '@/components/website/semi-navbar';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

// Component for handling email change confirmation
export default function PasswordReset() {
  const searchParams = useSearchParams();
  // View state: 0 = error, 1 = success, 2 = loading
  const [view, setView] = useState(2);

  // Effect to handle email change verification
  useEffect(() => {
    if (searchParams.get('code') !== null) {
      // Send verification code to API
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/change_email`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestid: searchParams.get('code') }),
      }).then((resp) => {
        // Update view based on API response
        if (resp.status === 200) {
          setView(1);
        } else {
          setView(0);
        }
      });
    } else {
      setView(0);
    }
  }, [searchParams]);

  // Effect to update page metadata
  useEffect(() => {
    document.title = 'Change Email | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Update your email address to stay connected with your Measurely account and continue tracking your metrics.',
      );
    }
  }, []);

  return (
    <Container>
      <SemiNavbar href='/sign-in' button='Sign in' />

      <Content>
        <div className='flex h-screen w-full items-center justify-center'>
          <div className='flex w-fit flex-col gap-[10px]'>
            {/* Error state */}
            {view === 0 ? (
              <>
                <div className='text-base font-semibold'>
                  Failed to change your email
                </div>
                <div className='mt-[10px] text-sm'>
                  the link might be invalid or expired
                </div>
              </>
            ) : (
              <></>
            )}

            {/* Success state */}
            {view === 1 ? (
              <>
                <div className='text-base font-semibold'>
                  Your email has been changed
                </div>
                <div className='mt-[10px] text-sm'>
                  You can now sign in with your new email
                </div>
              </>
            ) : (
              <></>
            )}

            {/* Loading state */}
            {view === 2 ? <Loader className='size-8 animate-spin' /> : <></>}

            {/* Support link shown in error and success states */}
            {view === 1 || view === 0 ? (
              <div className='mt-[10px] text-sm'>
                Need help?{' '}
                <a
                  href='mailto:info@measurely.dev'
                  className='cursor-pointer font-semibold'
                >
                  Contact support
                </a>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </Content>
    </Container>
  );
}
