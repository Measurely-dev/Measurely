// Import UI components and utilities
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';
import { AlignLeftIcon } from 'lucide-react';
import DocsMenu from './docs-menu';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent, 
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';

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
    <Drawer>
      {/* Drawer trigger button - only visible on mobile */}
      <DrawerTrigger asChild>
        <Button variant='ghost' size='icon' className='flex md:hidden'>
          <AlignLeftIcon className='h-5 w-5' />
        </Button>
      </DrawerTrigger>
      {/* Drawer content with navigation menu */}
      <DrawerContent className='flex flex-col gap-4 px-5'>
        <DrawerTitle className='sr-only !text-2xl'>Menu</DrawerTitle>
        <ScrollArea className='flex flex-col gap-4'>
          <Link href={'/register'}>
            <Button className='w-full rounded-[12px]'>Get started</Button>
          </Link>
          <div className='mx-2'>
            <DocsMenu isSheet />
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
