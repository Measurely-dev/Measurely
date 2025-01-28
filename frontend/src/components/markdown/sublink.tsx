'use client';

// Import necessary components and utilities
import { EachRoute } from '@/lib/routes-config';
import Anchor from './anchor';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { SheetClose } from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

/**
 * SubLink Component
 * Renders a collapsible navigation link that can contain nested sub-links
 *
 * @param title - Text to display for the link
 * @param href - URL the link points to
 * @param items - Array of child navigation items
 * @param noLink - If true, renders as text instead of link
 * @param level - Nesting depth level
 * @param isSheet - Whether this is rendered within a sheet component
 */
export default function SubLink({
  title,
  href,
  items,
  noLink,
  level,
  isSheet,
}: EachRoute & { level: number; isSheet: boolean }) {
  // Control expanded/collapsed state, top level starts expanded
  const [isOpen, setIsOpen] = useState(level == 0);

  // Base anchor component with active state styling
  const Comp = (
    <Anchor activeClassName='text-primary font-semibold' href={href}>
      {title}
    </Anchor>
  );

  // Determine whether to render as link, sheet close trigger, or plain text
  const titleOrLink = !noLink ? (
    isSheet ? (
      <SheetClose asChild>{Comp}</SheetClose>
    ) : (
      Comp
    )
  ) : (
    <div className='text-sm font-semibold text-primary'>{title}</div>
  );

  // Return simple link if no child items
  if (!items) {
    return <div className='flex flex-col'>{titleOrLink}</div>;
  }

  // Render collapsible section with child items
  return (
    <div className='flex w-full flex-col gap-1'>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className='flex items-center gap-2'>
          {titleOrLink}
          <CollapsibleTrigger asChild>
            <Button
              className='ml-auto mr-3.5 h-6 w-6 shadow-none'
              variant='link'
              size='icon'
            >
              {!isOpen ? (
                <ChevronRight className='h-[0.9rem] w-[0.9rem]' />
              ) : (
                <ChevronDown className='h-[0.9rem] w-[0.9rem]' />
              )}
              <span className='sr-only'>Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div
            className={cn(
              'ml-0.5 mt-2.5 flex flex-col items-start gap-3 text-sm text-neutral-800 dark:text-neutral-300/85',
              level > 0 && 'ml-1 border-l pl-4',
            )}
          >
            {/* Recursively render child items with updated properties */}
            {items?.map((innerLink) => {
              const modifiedItems = {
                ...innerLink,
                href: `${href + innerLink.href}`,
                level: level + 1,
                isSheet,
              };
              return <SubLink key={modifiedItems.href} {...modifiedItems} />;
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
