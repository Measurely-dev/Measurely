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

export default function FeedbackPopover(props: { children: any }) {
  return <FloatingPanelInput>{props.children}</FloatingPanelInput>;
}

function FloatingPanelInput(props: { children: ReactNode }) {
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
      <FloatingPanelTrigger
        className='flex h-9 flex-row items-center gap-2 !rounded-[12px] bg-accent px-3 text-muted-foreground transition-all duration-200 hover:text-primary'
        title='Send feedback'
      >
        {props.children}
      </FloatingPanelTrigger>
      <FloatingPanelContent className='mr-40 w-80'>
        <FloatingPanelForm onSubmit={handleSubmit}>
          <FloatingPanelBody>
            <FloatingPanelTextarea max={1000} className='min-h-[100px]' />
          </FloatingPanelBody>
          <FloatingPanelFooter>
            <FloatingPanelCloseButton />
            <FloatingPanelSubmitButton />
          </FloatingPanelFooter>
        </FloatingPanelForm>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}
