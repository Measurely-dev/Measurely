'use client';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
export default function FeedbackPopover(props: { children: any }) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const handleFeedback = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }).then((resp) => {
        if(resp.status === 200){
          toast.success("Thank you for your feedback")
        }else {
          resp.text().then(text => {
            toast.error(text)
          })
        }
      }).finally(() => {
        setLoading(false)
      })
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className='mr-5 mt-1 w-[200px] rounded-[16px] p-2 shadow-sm'>
        <form onSubmit={handleFeedback}>
          <Textarea
            placeholder='Tell us what you think...'
            className='h-20 resize-none'
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className='flex w-full items-end justify-end'>
            {' '}
            <Button
              className='mt-2 w-full rounded-[12px]'
              variant={'default'}
              size={'sm'}
              loading={loading}
              disabled={loading || content == ''}
            >
              Send
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
