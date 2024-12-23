'use client';

import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import AuthNavbar from '@/components/website/auth-navbar';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

export default function PasswordReset() {
  const searchParams = useSearchParams();
  const [view, set_view] = useState(2);

  useEffect(() => {
    if (searchParams.get('code') !== null) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/changeemail`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestid: searchParams.get('code') }),
      }).then((resp) => {
        if (resp.status === 200) {
          set_view(1);
        } else {
          set_view(0);
        }
      });
    } else {
      set_view(0);
    }
  }, [searchParams]);

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
    <WebContainer>
      <AuthNavbar href='/sign-in' button='Sign in' />

      <ContentContainer>
        <div className='flex h-screen w-full items-center justify-center'>
          <div className='flex w-fit flex-col gap-[10px]'>
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

            {view === 2 ? <Loader className='size-8 animate-spin' /> : <></>}

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
      </ContentContainer>
    </WebContainer>
  );
}
