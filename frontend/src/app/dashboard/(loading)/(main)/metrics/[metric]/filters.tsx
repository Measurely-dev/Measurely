import { Button } from '@/components/ui/button';
import { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Metric } from '@/types';
import { fetchEventVariation, valueFormatter } from '@/utils';
import { ChevronsUpDown, Command, CircleOff } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';

function Filters(props: {
  metric: Metric | null | undefined;
  activeFilter: Metric | null;
  setActiveFilter: Dispatch<SetStateAction<Metric | null>>;
  range: number;
  start: Date;
}) {
  const [filters, setFilters] = useState<{ [category: string]: any[] }>({});

  const updateFilters = async () => {
    const end = new Date(props.start);
    end.setDate(end.getDate() + (props.range - 1));
    const categories = Object.keys(props.metric?.filters ?? []);

    const finalFilters: { [category: string]: any[] } = {};

    await Promise.all(
      categories.map(async (category) => {
        const filters = props.metric?.filters[category] ?? [];
        const updatedFilters = await Promise.all(
          filters.map(async (filter: any) => {
            const { pos, neg } = await fetchEventVariation(
              filter.project_id,
              filter.id,
              props.start,
              end,
            );

            return {
              ...filter,
              summary: pos - neg,
            };
          }),
        );

        finalFilters[category] = updatedFilters.sort(
          (a, b) => b.summary - a.summary,
        );
      }),
    );

    setFilters(finalFilters);
  };

  useEffect(() => {
    updateFilters();
  }, [props.metric, props.range, props.start]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className='w-[250px] justify-between rounded-[12px] border bg-background hover:bg-background/70'
        >
          {props.activeFilter !== null
            ? props.activeFilter.name.charAt(0).toUpperCase() +
              props.activeFilter.name.slice(1).toLowerCase()
            : 'Select a filter'}
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='mr-10 w-fit min-w-[340px] max-w-[500px] overflow-hidden rounded-[12px] border p-0 shadow-md'>
        <Command>
          <CommandInput placeholder='Search filters...' />
          <CommandList>
            <CommandEmpty className='flex w-full flex-col items-center justify-center py-5'>
              <div className='relative mb-2 grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500'>
                <CircleOff className='h-6 w-6 text-muted-foreground' />
              </div>
              <h2 className='mt-3 max-w-[80%] text-center text-sm font-normal text-muted-foreground'>
                No filter to show at the moment
                <br />
                <a
                  href='/docs/features/filters'
                  className='cursor-pointer text-blue-500 underline'
                >
                  How to create one
                </a>
              </h2>
            </CommandEmpty>
            {props.metric?.filters ? (
              <CommandGroup>
                <CommandItem
                  className='truncate rounded-[10px]'
                  onSelect={() => props.setActiveFilter(null)}
                >
                  {!props.activeFilter ? (
                    <div
                      className={cn(
                        'mr-1.5 size-3 min-w-3 rounded-full border bg-black',
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        'mr-1.5 size-3 min-w-3 rounded-full border bg-accent',
                      )}
                    />
                  )}
                  None
                </CommandItem>
              </CommandGroup>
            ) : null}

            {Object.keys(filters).map((filterCategory: string) => {
              return (
                <>
                  <CommandGroup
                    key={filterCategory}
                    heading={
                      filterCategory.charAt(0).toUpperCase() +
                      filterCategory.slice(1).toLowerCase()
                    }
                  >
                    {filters[filterCategory].map((filter) => {
                      return (
                        <CommandItem
                          key={filter.id}
                          className='truncate rounded-[10px]'
                          value={filter.name}
                          onSelect={(value) => {
                            if (props.activeFilter?.id === filter.id) {
                              props.setActiveFilter(null);
                            } else {
                              const metric = props.metric?.filters[
                                filterCategory
                              ].find((m) => m.name === value);
                              props.setActiveFilter(metric ?? null);
                            }
                          }}
                        >
                          {props.activeFilter?.id === filter.id ? (
                            <div
                              className={cn(
                                'mr-1.5 size-3 min-w-3 rounded-full border bg-black',
                              )}
                            />
                          ) : (
                            <div
                              className={cn(
                                'mr-1.5 size-3 min-w-3 rounded-full border bg-accent',
                              )}
                            />
                          )}
                          <div className='text-medium flex w-full gap-1 truncate capitalize'>
                            {filter.summary === 0 ? (
                              <div className='h-fit w-fit rounded-[6px] bg-zinc-500/10 px-2 py-0.5 font-mono text-xs text-zinc-500'>
                                0
                              </div>
                            ) : filter.summary > 0 ? (
                              <div className='h-fit w-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-xs text-green-500'>
                                +{valueFormatter(filter.summary)}
                              </div>
                            ) : (
                              <div className='h-fit w-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-xs text-red-500'>
                                -{valueFormatter(filter.summary)}
                              </div>
                            )}

                            <div className='w-full truncate'>{filter.name}</div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Filters;
