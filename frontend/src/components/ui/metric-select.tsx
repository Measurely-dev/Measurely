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

export function MetricSelect(props: {
  selectedMetrics: Metric[];
  setSelectedMetrics: React.Dispatch<React.SetStateAction<Metric[]>>;
  min: number;
  max: number;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  const { projects, activeProject } = React.useContext(ProjectsContext);

  const projectMetrics = projects?.[activeProject]?.metrics ?? [];

  const toggleMetric = (metric: Metric) => {
    const isAlreadySelected = props.selectedMetrics.some(
      (m) => m.id === metric.id,
    );

    if (isAlreadySelected) {
      if (props.selectedMetrics.length > 0) {
        props.setSelectedMetrics((currentMetrics) =>
          currentMetrics.filter((m) => m.id !== metric.id),
        );
      }
    } else {
      if (props.max === 1) {
        props.setSelectedMetrics([metric]);
      } else {
        if (props.selectedMetrics.length >= props.max) return;
        props.setSelectedMetrics((currentMetrics) => [
          ...currentMetrics,
          metric,
        ]);
      }
    }
    inputRef?.current?.focus();
  };
  const onComboboxOpenChange = (value: boolean) => {
    inputRef.current?.blur();
    setOpenCombobox(value);
  };

  const clearSelectedMetrics = () => {
    if (props.selectedMetrics.length > 0) {
      props.setSelectedMetrics([]);
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
              {props.selectedMetrics.length === 0 && 'Select metric(s)'}
              {props.selectedMetrics.length === 1 &&
                props.selectedMetrics[0].name}
              {props.selectedMetrics.length === 2 &&
                props.selectedMetrics.map(({ name }) => name).join(', ')}
              {props.selectedMetrics.length > 2 &&
                `${props.selectedMetrics.length} metrics selected`}
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
                {projectMetrics.length > 0 ? (
                  projectMetrics.map((metric) => {
                    const isActive = props.selectedMetrics.some(
                      (m) => m.id === metric.id,
                    );
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
                  })
                ) : (
                  <div className='p-2 text-center text-sm text-muted-foreground'>
                    No metrics available.
                  </div>
                )}
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
        {props.selectedMetrics.map(({ name, id }) => (
          <Badge
            key={id}
            variant='outline'
            className='group relative w-fit px-3 select-none rounded-full border border-input bg-accent/80 text-sm font-medium text-muted-foreground shadow-none'
          >
            {name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
