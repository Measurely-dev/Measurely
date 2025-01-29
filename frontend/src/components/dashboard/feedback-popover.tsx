'use client';
import { toast } from 'sonner';
import React, { ReactNode } from 'react';
import {
  FloatingPanelBody,
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelForm,
  FloatingPanelRoot,
  FloatingPanelSubmitButton,
  FloatingPanelTextarea,
  FloatingPanelTrigger,
} from '@/components/ui/floating-panel';
import { XIcon } from 'lucide-react';

// Main feedback component that wraps the floating panel functionality
export default function FeedbackPopover(props: { children: any }) {
  return <FloatingPanelInput>{props.children}</FloatingPanelInput>;
}

// Component that handles the floating panel input and submission logic
function FloatingPanelInput(props: { children: ReactNode }) {
  // Handles form submission by sending feedback content to the API
  const handleSubmit = (content: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }).then((resp) => {
      if (resp.status === 200) {
        toast.success('Thank you for your feedback');
      } else {
        resp.text().then((text) => {
          toast.error(text);
        });
      }
    });
  };

  return (
    <FloatingPanelRoot>
      <FloatingPanelTrigger title='Send feedback'>
        {props.children}
      </FloatingPanelTrigger>
      <FloatingPanelContent className='w-80' side='right'>
        <FloatingPanelForm onSubmit={handleSubmit}>
          <FloatingPanelBody>
            <FloatingPanelTextarea max={1000} className='min-h-[100px]' />
          </FloatingPanelBody>
          <FloatingPanelFooter>
            <FloatingPanelCloseButton
              icon={<XIcon size={16} />}
              ariaLabel='Close panel'
            />
            <FloatingPanelSubmitButton>
              Send Message
            </FloatingPanelSubmitButton>
          </FloatingPanelFooter>
        </FloatingPanelForm>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}
