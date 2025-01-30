// Import core UI components, navigation elements and layout utilities
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';
import { AlignLeftIcon } from 'lucide-react';
import DocsMenu from './docs-menu';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

// Main documentation sidebar - Desktop version
// Contains navigation menu in a fixed scrollable container
export function Leftbar() {
  return (
    <aside className='sticky top-16 hidden h-[94.5vh] min-w-[230px] flex-[1] flex-col overflow-y-auto md:flex'>
      <ScrollArea className='py-4'>
        <DocsMenu />
      </ScrollArea>
    </aside>
  );
}

// Mobile optimized sidebar implementation
// Opens as slide-out sheet with full navigation menu
export function SheetLeftbar() {
  return (
    <Sheet>
      {/* Mobile menu trigger - Hamburger button */}
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='flex rounded-[12px] md:hidden'>
          <AlignLeftIcon className='h-5 w-5' />
        </Button>
      </SheetTrigger>
      {/* Mobile sheet with navigation and call-to-action */}
      <SheetContent
        side='left'
        isClosable={false}
        className='flex flex-col gap-4 pb-0'
      >
        <SheetTitle className='sr-only'>Docs</SheetTitle>
        <div className='flex w-full flex-row gap-1'>
          <Link
            href='https://github.com/measurely-dev/measurely'
            target='_blank'
            className='w-full'
          >
            <Button variant='outline' className='w-full rounded-xl'>
              <GitHubLogoIcon className='size-5' />
            </Button>
          </Link>
          <Link href={'/register'} className='w-full'>
            <Button className='w-full rounded-[12px]'>Get started</Button>
          </Link>
        </div>
        <ScrollArea className='flex flex-col gap-4 border-t'>
          <div className='mx-2'>
            <DocsMenu isSheet />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
