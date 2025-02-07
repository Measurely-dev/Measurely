'use client';

import { Fragment, useContext, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from './label';
import { Unit } from '@/types';
import { toast } from 'sonner';
import { ProjectsContext } from '@/dash-context';

const unitCategories = [
  {
    label: 'Basic Units',
    units: [
      { name: 'Hours', symbol: 'h' },
      { name: 'Minutes', symbol: 'min' },
      { name: 'Seconds', symbol: 's' },
      { name: 'Milliseconds', symbol: 'ms' },
      { name: 'Days', symbol: 'd' },
      { name: 'Weeks', symbol: 'w' },
      { name: 'Months', symbol: 'mo' },
      { name: 'Years', symbol: 'y' },
    ],
  },
  {
    label: 'Performance Metrics',
    units: [
      { name: 'Bytes', symbol: 'B' },
      { name: 'Kilobytes', symbol: 'KB' },
      { name: 'Megabytes', symbol: 'MB' },
      { name: 'Gigabytes', symbol: 'GB' },
      { name: 'Terabytes', symbol: 'TB' },
      { name: 'Ops per Second', symbol: 'ops/s' },
      { name: 'Milliseconds per Operation', symbol: 'ms/op' },
      { name: 'Transactions per Second', symbol: 'tps' },
    ],
  },
  {
    label: 'Engagement Metrics',
    units: [
      { name: 'Percentage', symbol: '%' },
      { name: 'Clicks', symbol: 'clicks' },
      { name: 'Shares', symbol: 'shares' },
      { name: 'Views', symbol: 'views' },
      { name: 'Impressions', symbol: 'impressions' },
      { name: 'Engagement Rate', symbol: '%' },
      { name: 'Conversion Rate', symbol: '%' },
      { name: 'Sessions', symbol: 'sessions' },
    ],
  },
  {
    label: 'Monetary Units',
    units: [
      { name: 'CAD', symbol: '$' },
      { name: 'USD', symbol: '$' },
      { name: 'EUR', symbol: '€' },
      { name: 'GBP', symbol: '£' },
      { name: 'JPY', symbol: '¥' },
      { name: 'Revenue', symbol: '$' },
      { name: 'Cost', symbol: '$' },
      { name: 'Profit', symbol: '$' },
    ],
  },
];

interface UnitComboboxProps {
  unit?: string;
  type?: 'lg' | 'sm';
  onChange?: (value: string) => void;
  customUnits: Unit[];
}
export function UnitCombobox({
  type = 'sm',
  unit,
  onChange,
  customUnits,
}: UnitComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(unit ?? '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitSymbol, setNewUnitSymbol] = useState('');

  const { projects, setProjects, activeProject } = useContext(ProjectsContext);

  const handleAddUnit = () => {
    if (!newUnitName || !newUnitSymbol) return;

    const newUnit = {
      name: newUnitName,
      symbol: newUnitSymbol,
    };

    if (customUnits.find((unit) => unit.name === newUnitName)) {
      toast.error('Unit with the same name already exists');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/project-units`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projects[activeProject].id,
        units: [...customUnits, newUnit],
      }),
    }).then((resp) => {
      if (resp.ok) {
        setProjects(
          projects.map((proj, i) =>
            i === activeProject
              ? Object.assign({}, proj, {
                  units: [...proj.units, newUnit],
                })
              : proj,
          ),
        );
      } else {
        resp.text().then((text) => {
          toast.error(text);
        });
      }
    });

    setNewUnitName('');
    setNewUnitSymbol('');
    setIsDialogOpen(false);
  };

  const handleSelectUnit = (currentValue: string) => {
    setValue(currentValue === value ? '' : currentValue);
    setOpen(false);
    if (onChange) {
      onChange(currentValue === value ? '' : currentValue);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        {type === 'lg' ? (
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='h-11 w-full justify-between rounded-[12px]'
            >
              {value !== '' ? value : 'Select Unit (optional)'}
              <ChevronDown className='ml-1 size-4' />
            </Button>
          </PopoverTrigger>
        ) : (
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='h-fit justify-between rounded-[8px] border bg-accent px-3 py-1 font-normal text-muted-foreground hover:text-primary'
            >
              {value !== '' ? value : 'Select Unit'}

              <ChevronDown className='ml-1 size-4' />
            </Button>
          </PopoverTrigger>
        )}
        <PopoverContent className='w-[300px] overflow-hidden rounded-[12px] p-0 shadow-md'>
          <Command>
            <CommandInput
              placeholder='Search unit...'
              className='h-11 font-medium'
            />
            <CommandList>
              <CommandEmpty>
                <span className='text-md font-normal'>No unit found</span>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  className='cursor-pointer rounded-[10px] py-2 font-normal'
                  onSelect={() => {
                    setOpen(false);
                    setIsDialogOpen(true);
                  }}
                >
                  + Add New Unit
                </CommandItem>
              </CommandGroup>
              {customUnits.length > 0 && (
                <>
                  <CommandSeparator />

                  <CommandGroup heading='Custom Units'>
                    {customUnits.map((unit) => {
                      const unitValue =
                        unit.name + (unit.symbol !== '' && ` (${unit.symbol})`);
                      return (
                        <CommandItem
                          className='cursor-pointer rounded-[10px] py-2 font-normal'
                          key={unit.name}
                          value={unitValue}
                          onSelect={handleSelectUnit}
                        >
                          {unitValue}
                          <Check
                            className={cn(
                              'ml-auto',
                              value === unitValue ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
              {unitCategories.map(
                (category, i) =>
                  category.units.length > 0 && (
                    <Fragment key={`category-${i}`}>
                      <CommandSeparator />

                      <CommandGroup heading={category.label}>
                        {category.units.map((unit) => {
                          const unitValue =
                            unit.name +
                            (unit.symbol !== '' && ` (${unit.symbol})`);
                          return (
                            <CommandItem
                              className='cursor-pointer rounded-[10px] py-2 font-normal'
                              key={unit.name}
                              value={unitValue}
                              onSelect={handleSelectUnit}
                            >
                              {unitValue}
                              <Check
                                className={cn(
                                  'ml-auto',
                                  value === unitValue
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Fragment>
                  ),
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(e) => {
          setIsDialogOpen(e);
          if (!e) {
            setNewUnitName('');
            setNewUnitSymbol('');
          }
        }}
      >
        <DialogContent>
          <DialogTitle>Create a New Unit</DialogTitle>
          <DialogDescription>
            Add a name and symbol for your new unit.
          </DialogDescription>
          <div>
            <Label>Unit name</Label>
            <Input
              type='text'
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder='Unit Name (e.g., Minutes)'
              className='mb-4 mt-2 h-11 rounded-[12px]'
            />
            <Label>Unit symbol (optional)</Label>
            <Input
              type='text'
              value={newUnitSymbol}
              onChange={(e) => setNewUnitSymbol(e.target.value)}
              placeholder='Unit Symbol (e.g., min)'
              className='mt-2 h-11 rounded-[12px]'
            />
          </div>
          <DialogFooter>
            <Button
              variant='secondary'
              className='rounded-[12px]'
              onClick={() => {
                setIsDialogOpen(false);
                setNewUnitName('');
                setNewUnitSymbol('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUnit}
              className='rounded-[12px]'
              disabled={!newUnitName}
            >
              Add Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
