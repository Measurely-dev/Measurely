import * as React from 'react';
import { Check, ChevronsUpDown, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Metric } from '@/types';

export function FilterCategorySelect(props: {
  metric: Metric;
  selectedFilterCategory: string;
  setSelectedFilterCategory: React.Dispatch<React.SetStateAction<string>>;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  console.log(props.metric);

  const filterCategories = Object.keys(props.metric?.filters || {});

  const toggleFilterCategory = (category: string) => {
    if (props.selectedFilterCategory === category) {
      props.setSelectedFilterCategory('');
    } else {
      props.setSelectedFilterCategory(category);
    }
    inputRef?.current?.focus();
  };

  const onComboboxOpenChange = (value: boolean) => {
    inputRef.current?.blur();
    setOpenCombobox(value);
  };

  const clearSelectedFilterCategory = () => {
    if (props.selectedFilterCategory) {
      props.setSelectedFilterCategory('');
    }
  };

  return (
    <div className='w-full'>
      <Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={openCombobox}
            className='h-11 w-full justify-between rounded-[12px] text-foreground'
          >
            <span className='truncate'>
              {!props.selectedFilterCategory && 'Select filter category'}
              {props.selectedFilterCategory}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] max-w-none overflow-hidden rounded-[12px] p-0 shadow-md'>
          <Command loop>
            <CommandInput
              ref={inputRef}
              placeholder='Search filter categories...'
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty>
              {filterCategories.length === 0
                ? 'No filter categories available.'
                : 'No filter categories found.'}
            </CommandEmpty>
            <CommandList>
              <CommandGroup className='max-h-[300px] overflow-auto'>
                {filterCategories.length > 0 ? (
                  filterCategories.map((category) => {
                    const isActive = props.selectedFilterCategory === category;
                    return (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={() => toggleFilterCategory(category)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isActive ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className='flex-1 capitalize'>{category}</div>
                      </CommandItem>
                    );
                  })
                ) : (
                  <div className='p-2 text-center text-sm text-muted-foreground'>
                    No filter categories available.
                  </div>
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  className='flex items-center justify-center gap-1 !text-center text-sm !text-destructive'
                  onSelect={clearSelectedFilterCategory}
                >
                  <Trash className='size-4' /> Clear filter category
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className='relative mt-3 h-fit overflow-y-auto'>
        {props.selectedFilterCategory && (
          <Badge
            variant='outline'
            className='group relative w-fit select-none rounded-full border border-input bg-accent/80 px-3 text-sm font-medium text-muted-foreground shadow-none'
          >
            {props.selectedFilterCategory}
          </Badge>
        )}
      </div>
    </div>
  );
}
