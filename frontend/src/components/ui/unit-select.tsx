'use client';

import { useState } from 'react';
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

type Unit = { label: string; value: string };
const unitCategories = [
  {
    label: 'Basic Units',
    units: [
      { label: 'Visitors', value: 'visitors' },
      { label: 'Clients', value: 'clients' },
      { label: 'Requests', value: 'requests' },
      { label: 'Sessions', value: 'sessions' },
      { label: 'Page Views', value: 'views' },
      { label: 'Unique Visitors', value: 'unique-visitors' },
      { label: 'Bounce Rate (%)', value: 'bounce-rate' },
      { label: 'Conversion Rate (%)', value: 'conversion-rate' },
    ],
  },
  {
    label: 'Performance Metrics',
    units: [
      { label: 'CPU Usage (%)', value: 'cpu-usage' },
      { label: 'Memory Usage (MB)', value: 'memory-usage' },
      { label: 'Disk Space (GB)', value: 'disk-space' },
      { label: 'Latency (ms)', value: 'latency' },
      { label: 'Error Rate (%)', value: 'error-rate' },
      { label: 'Throughput (ops/sec)', value: 'throughput' },
      { label: 'Response Time (ms)', value: 'response-time' },
      { label: 'Network Traffic (MB)', value: 'network-traffic' },
    ],
  },
  {
    label: 'Engagement Metrics',
    units: [
      {
        label: 'Average Session Duration (min)',
        value: 'avg-session-duration',
      },
      { label: 'Pages per Session', value: 'pages-per-session' },
      { label: 'Social Shares', value: 'social-shares' },
      { label: 'Email Open Rate (%)', value: 'email-open-rate' },
      { label: 'Click-Through Rate (%)', value: 'click-through-rate' },
    ],
  },
  {
    label: 'Monetary Units',
    units: [
      { label: 'CAD ($)', value: 'money-cad' },
      { label: 'USD ($)', value: 'money-usd' },
      { label: 'EUR (€)', value: 'money-eur' },
      { label: 'GBP (£)', value: 'money-gbp' },
      { label: 'Revenue ($)', value: 'revenue' },
      { label: 'Cost ($)', value: 'cost' },
      { label: 'Profit ($)', value: 'profit' },
      { label: 'Return on Investment (%)', value: 'roi' },
    ],
  },
];

interface UnitComboboxProps {
  type?: 'lg' | 'sm';
  onChange?: (value: string) => void;
}
export function UnitCombobox({ type = 'sm', onChange }: UnitComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customUnits, setCustomUnits] = useState<Unit[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitSymbol, setNewUnitSymbol] = useState('');

  const handleAddUnit = () => {
    if (!newUnitName || !newUnitSymbol) return;
    const newUnit = {
      label: `${newUnitName} (${newUnitSymbol})`,
      value: newUnitSymbol.toLowerCase(),
    };
    setCustomUnits((prev) => [newUnit, ...prev]);
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
              {value
                ? customUnits
                    .concat(...unitCategories.map((cat) => cat.units))
                    .find((unit) => unit.value === value)?.label
                : 'Select Unit'}
              <ChevronDown className='ml-1 size-4' />
            </Button>
          </PopoverTrigger>
        ) : (
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='h-fit justify-between rounded-[8px] border-none bg-accent px-3 py-1 font-normal text-muted-foreground hover:text-primary'
            >
              {value
                ? customUnits
                    .concat(...unitCategories.map((cat) => cat.units))
                    .find((unit) => unit.value === value)?.label
                : 'Unit'}
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
                    {customUnits.map((unit) => (
                      <CommandItem
                        className='cursor-pointer rounded-[10px] py-2 font-normal'
                        key={unit.value}
                        value={unit.value}
                        onSelect={handleSelectUnit}
                      >
                        {unit.label}
                        <Check
                          className={cn(
                            'ml-auto',
                            value === unit.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
              {unitCategories.map(
                (category) =>
                  category.units.length > 0 && (
                    <>
                      <CommandSeparator />

                      <CommandGroup
                        key={category.label}
                        heading={category.label}
                      >
                        {category.units.map((unit) => (
                          <CommandItem
                            className='cursor-pointer rounded-[10px] py-2 font-normal'
                            key={unit.value}
                            value={unit.value}
                            onSelect={handleSelectUnit}
                          >
                            {unit.label}
                            <Check
                              className={cn(
                                'ml-auto',
                                value === unit.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
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
