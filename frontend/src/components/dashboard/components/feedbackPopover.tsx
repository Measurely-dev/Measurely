import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
export default function FeedbackPopover(props: { children: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className='mr-5 mt-1 w-[200px] rounded-[16px] p-2 shadow-sm'>
        <Textarea
          placeholder='Tell us what you think...'
          className='h-20 resize-none'
        />
        <div className='flex w-full items-end justify-end'>
          {' '}
          <Button
            className='mt-2 w-full rounded-[12px]'
            variant={'default'}
            size={'sm'}
          >
            Send
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
