'use client';

// Import required components and hooks
import AuthForm from '@/components/website/auth-form';
import SemiNavbar from '@/components/website/semi-navbar';
import Container from '@/components/website/container';
import Content from '@/components/website/content';
import React, { useState } from 'react';
import { toast } from 'sonner';

// Component for handling waitlist signups
const Waitlist = () => {
  // State to track form submission loading status
  const [loading, setLoading] = useState(false);

  return (
    <Container className='min-h-[800px]'>
      {/* Navigation section */}
      <div className='mb-[150px]'>
        <SemiNavbar href='/sign-in' button='Sign in' />
      </div>

      <Content>
        {/* Waitlist signup form */}
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

            // Extract and format form data
            const email = form.get('email')?.toString().toLowerCase().trim();
            const name = form.get('name')?.toString().toLowerCase().trim();

            // Submit waitlist signup request to API
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/waitlist`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, name }),
            })
              .then((res) => {
                // Handle different response statuses
                if (res.status === 200) {
                  toast.success('Succesfully joined the waitlist');
                } else {
                  res.text().then((text) => {
                    if (res.status === 208) {
                      toast.warning(text);  // Already in waitlist
                    } else {
                      toast.error(text);    // Other errors
                    }
                  });
                }
              })
              .finally(() => {
                setLoading(false);  // Reset loading state
              });
          }}
          policies
        />
      </Content>
    </Container>
  );
};

export default Waitlist;
