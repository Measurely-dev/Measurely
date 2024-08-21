'use client';

import WebContainer from '@/components/website/containers/container';
import ContentContainer from '@/components/website/containers/content';
import AuthNavbar from '@/components/website/layout/authNav/navbar';
import Link from 'next/link';
import { useState } from 'react';

export default function AccountVerification() {

  const [view, set_view] = useState(3); // 0 : email sent , 1 : verification success view , 2 : fail view , 3 :loading view
  return (
    <WebContainer>
      <AuthNavbar href='/sign-in' button='Sign in' />
      <ContentContainer>
        <div className='flex h-screen w-full items-center justify-center'>
          <div className='flex w-fit flex-col gap-[10px]'>
            {
              // Loading view
              view === 3 ? (
                <>LOADING ...</>
              ) : (
                <>
                  {
                    // Email sent view
                    view === 0 ? (
                      <>
                        <div className='text-base font-semibold'>
                          Check your email
                        </div>
                        <div className='mt-[10px] text-sm'>
                          We emailed a magic link to{' '}
                          <span className='font-semibold'>
                            unkown@mail.com
                          </span>
                          .
                          <br />
                          Proceed by opening the link.
                        </div>
                      </>
                    ) : (
                      <>
                        {
                          // Verification success view
                          view === 1 ? (
                            <>
                              <div className='text-base font-semibold'>

                                  Your account has been successfully verified
                              </div>
                              <Link href={'/dashboard'}>Go to Dashboard</Link>
                            </>
                          ) : (
                            // Invalid code view
                            <>
                              <div className='text-base font-semibold'>
                                The verification has failed
                              </div>
                              <div className='mt-[10px] text-sm'>
                                the link might be invalid or expired
                              </div>
                            </>
                          )
                        }
                      </>
                    )
                  }
                  <div className='mt-[10px] text-sm'>
                    Need help?{' '}
                    <span className='cursor-pointer font-semibold'>
                      Contact support
                    </span>
                  </div>
                </>
              )
            }
          </div>
        </div>
      </ContentContainer>
    </WebContainer>
  );
}
