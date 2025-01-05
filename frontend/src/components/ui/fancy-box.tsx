'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
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
import { ProjectsContext } from '@/dash-context';
import { Metric } from '@/types';

export function FancyBox() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [selectedMetrics, setSelectedMetrics] = React.useState<Metric[]>([]);
  const { projects, activeProject } = React.useContext(ProjectsContext);

  const toggleMetric = (metric: Metric) => {
    setSelectedMetrics((currentMetrics) =>
      !currentMetrics.includes(metric)
        ? [...currentMetrics, metric]
        : currentMetrics.filter((m) => m.id !== metric.id),
    );
    inputRef?.current?.focus();
  };

  const onComboboxOpenChange = (value: boolean) => {
    inputRef.current?.blur();
    setOpenCombobox(value);
  };

  const clearSelectedMetrics = () => {
    setSelectedMetrics([]);
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
              {selectedMetrics.length === 0 && 'Select metric(s)'}
              {selectedMetrics.length === 1 && selectedMetrics[0].name}
              {selectedMetrics.length === 2 &&
                selectedMetrics.map(({ name }) => name).join(', ')}
              {selectedMetrics.length > 2 &&
                `${selectedMetrics.length} metrics selected`}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] max-w-none overflow-hidden rounded-[12px] p-0 shadow-md'>
          <Command loop>
            <CommandInput
              ref={inputRef}
              placeholder='Search metrics...'
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandGroup className='max-h-[300px] overflow-auto'>
                {projects[activeProject].metrics?.map((metric) => {
                  const isActive = selectedMetrics.includes(metric);
                  return (
                    <CommandItem
                      key={metric.id}
                      value={metric.name}
                      onSelect={() => toggleMetric(metric)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className='flex-1 capitalize'>{metric.name}</div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  className='flex items-center justify-center gap-1 !text-center text-sm !text-destructive'
                  onSelect={clearSelectedMetrics}
                >
                  <Trash className='size-4' /> Clear metric(s)
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className='relative mt-3 h-fit overflow-y-auto'>
        {selectedMetrics.map(({ name, id }) => (
          <Badge
            key={id}
            variant='outline'
            className='mb-2 mr-2 border bg-background text-primary'
          >
            {name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
