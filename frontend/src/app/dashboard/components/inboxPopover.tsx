import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { Archive, Inbox, MessageCircle } from 'react-feather';
export default function InboxPopover(props: { children: any }) {
  return (
    <Popover>
      <PopoverTrigger>{props.children}</PopoverTrigger>
      <PopoverContent className='mr-5 mt-1 w-[370px] rounded-[16px] p-0 pb-5 shadow-sm'>
        <Tabs className='mt-3'>
          <TabsList className='!mb-0 flex !h-fit w-fit items-start gap-1 rounded-none border-none bg-transparent !p-0 !pb-0'>
            <TabsTrigger
              value='inbox'
              className='rounded-none border-b-2 border-transparent !bg-transparent px-3 pb-2 !shadow-none data-[state=active]:border-b-primary'
            >
              Inbox
            </TabsTrigger>
            <TabsTrigger
              value='messages'
              className='rounded-none border-b-2 border-transparent !bg-transparent px-3 pb-2 !shadow-none data-[state=active]:border-b-primary'
            >
              Messages
            </TabsTrigger>
            <TabsTrigger
              value='archive'
              className='rounded-none border-b-2 border-transparent !bg-transparent px-3 pb-2 !shadow-none data-[state=active]:border-b-primary'
            >
              Archive
            </TabsTrigger>
          </TabsList>
          <Separator className='!mt-0' />
          {/* Tab content */}
          <TabsContent value='inbox'>
            <div className='flex h-96 w-full flex-col items-center justify-center'>
              <div className='flex size-14 items-center justify-center rounded-full bg-accent'>
                <Inbox className='size-7 text-secondary' />
              </div>
              <div className='mt-4 text-sm text-secondary'>
                No new notifications
              </div>
            </div>
          </TabsContent>
          <TabsContent value='messages'>
            <div className='flex h-96 w-full flex-col items-center justify-center'>
              <div className='flex size-14 items-center justify-center rounded-full bg-accent'>
                <MessageCircle className='size-7 text-secondary' />
              </div>
              <div className='mt-4 text-sm text-secondary'>No new messages</div>
            </div>
          </TabsContent>
          <TabsContent value='archive'>
            <div className='flex h-96 w-full flex-col items-center justify-center'>
              <div className='flex size-14 items-center justify-center rounded-full bg-accent'>
                <Archive className='size-7 text-secondary' />
              </div>
              <div className='mt-4 text-sm text-secondary'>Empty archive</div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
