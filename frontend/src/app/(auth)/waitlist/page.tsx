'use client';
import AuthForm from '@/components/website/auth';
import AuthNavbar from '@/components/website/auth-navbar';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import React, { useState } from 'react';
import { toast } from 'sonner';

const Waitlist = () => {
  const [loading, setLoading] = useState(false);

  return (
    <WebContainer className='min-h-[800px]'>
      <div className='mb-[150px]'>
        <AuthNavbar href='/sign-in' button='Sign in' />
      </div>
      <ContentContainer>
        <AuthForm
          title='Join our waitlist'
          description='As soon as Measurely release, you will be notified.'
          providers={false}
          form={[
            {
              label: 'Name',
              name: 'name',
              placeholder: 'name',
              type: 'name',
            },
            {
              label: 'Email',
              name: 'email',
              placeholder: 'john.doe@exemple.com',
              type: 'email',
            },
          ]}
          button='Join waitlist'
          btn_loading={loading}
          action={(form) => {
            setLoading(true);
            const email = form.get('email')?.toString().toLowerCase().trim();
            const name = form.get('name')?.toString().toLowerCase().trim();

            fetch(`${process.env.NEXT_PUBLIC_API_URL}/waitlist`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: email, name: name }),
            })
              .then((res) => {
                if (res.status === 200) {
                  toast.success('Succesfully joined the waitlist');
                } else {
                  res.text().then((text) => {
                    if (res.status === 208) {
                      toast.warning(text);
                    } else {
                      toast.error(text);
                    }
                  });
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          policies
        />
      </ContentContainer>
    </WebContainer>
  );
};

export default Waitlist;
