// Import UI components and utilities
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';
import { AlignLeftIcon } from 'lucide-react';
import DocsMenu from './docs-menu';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';

// Desktop sidebar component that shows documentation menu
export function Leftbar() {
  return (
    <aside className='sticky top-16 hidden h-[94.5vh] min-w-[230px] flex-[1] flex-col overflow-y-auto md:flex'>
      <ScrollArea className='py-4'>
        <DocsMenu />
      </ScrollArea>
    </aside>
  );
}

// Mobile sidebar component that shows as a drawer/sheet
export function SheetLeftbar() {
  return (
    <Sheet>
      {/* Drawer trigger button - only visible on mobile */}
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='flex md:hidden'>
          <AlignLeftIcon className='h-5 w-5' />
        </Button>
      </SheetTrigger>
      {/* Drawer content with navigation menu */}
      <SheetContent
        side='left'
        isClosable={false}
        className='flex flex-col gap-4 pb-0'
      >
        <SheetTitle>Docs</SheetTitle>
        <Link href={'/register'}>
          <Button className='w-full rounded-[12px]'>Get started</Button>
        </Link>
        <ScrollArea className='flex flex-col gap-4 border-t'>
          <div className='mx-2'>
            <DocsMenu isSheet />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
