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
      <PopoverTrigger>{props.children}</PopoverTrigger>
      <PopoverContent className='mr-5 mt-1 w-[170px] rounded-[16px] p-2 shadow-sm'>
        <Textarea
          placeholder='Type a feedback...'
          className='h-20 resize-none'
        />
        <div className='w-full justify-end items-end flex'>
          {' '}
          <Button className='mt-2 rounded-[12px]' variant={'secondary'} size={'sm'}>
            Send
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
