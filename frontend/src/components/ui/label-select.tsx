'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Edit, Edit2, Trash } from 'lucide-react';

import { cn, getContrastYIQ } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion-base';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DialogClose } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ColorDropdown } from '@/app/dashboard/(loading)/(main)/page';

type LabelType = Record<'value' | 'label' | 'color', string>;

const LABELS = [
  {
    value: 'compare',
    label: 'Compare',
    color: '#8b5cf6',
  },
  {
    value: 'overview',
    label: 'Overview',
    color: '#E91E63',
  },
  {
    value: 'revenue',
    label: 'Revenue',
    color: '#3b82f6',
  },
  {
    value: 'profit',
    label: 'Profit',
    color: '#06b6d4',
  },
  {
    value: 'growth',
    label: 'Growth',
    color: '#eab308',
  },
] satisfies LabelType[];
export function LabelSelect(props: {
  setIsSelected: (state: boolean) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [labels, setLabels] = React.useState<LabelType[]>(LABELS);
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [selectedValues, setSelectedValues] = React.useState<LabelType[]>([]);
  props.setIsSelected(selectedValues.length === 0 ? false : true);
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
    '',
  );

  const createLabel = (name: string) => {
    const isValid = /^[a-zA-Z0-9\s-_]+$/.test(name);

    if (!isValid) {
      toast.error('Please choose a valid label.');
      return;
    }
    const defaultColor = '#000';

    const newLabel = {
      value: name.toLowerCase(),
      label: name,
      color: selectedColor || defaultColor,
    };

    setLabels((prev) => [...prev, newLabel]);
    setInputValue('');
    setSelectedValues([newLabel]);
    setSelectedColor(newLabel.color);
  };

  const toggleLabel = (label: LabelType) => {
    setSelectedValues((current) => {
      const isSelected = current.some((item) => item.value === label.value);
      if (isSelected) {
        return [];
      }
      setSelectedColor(label.color);
      return [label];
    });
    inputRef?.current?.focus();
  };

  const updateLabel = (label: LabelType, newLabel: LabelType) => {
    setLabels((prev) =>
      prev.map((l) => (l.value === label.value ? newLabel : l)),
    );
    setSelectedValues((current) =>
      current.map((l) => (l.value === label.value ? newLabel : l)),
    );
    setSelectedColor(newLabel.color);
  };

  const deleteLabel = (label: LabelType) => {
    setLabels((prev) => prev.filter((l) => l.value !== label.value));
    setSelectedValues((current) =>
      current.filter((l) => l.value !== label.value),
    );
    if (selectedValues.length === 1) {
      setSelectedColor('');
    }
  };

  const onComboboxOpenChange = (value: boolean) => {
    inputRef.current?.blur();
    setOpenCombobox(value);
  };

  return (
    <div className='max-w-full'>
      <Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={openCombobox}
            className='h-11 w-full justify-between rounded-[12px] text-foreground'
          >
            <span className='flex items-center'>
              {selectedValues.length === 0
                ? 'Select label(s)'
                : selectedValues.map((selected) => (
                    <Badge
                      key={selected.value}
                      variant='outline'
                      className='truncate'
                      style={badgeStyle(selected.color)}
                    >
                      {selected.label}
                    </Badge>
                  ))}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='max-h-[300px] w-[300px] overflow-hidden rounded-[12px] p-0'>
          <Command loop>
            <CommandInput
              ref={inputRef}
              placeholder='Type a label to create or find it...'
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandGroup className='max-h-[300px] overflow-auto'>
                {labels.map((label) => {
                  const isActive = selectedValues.some(
                    (item) => item.value === label.value,
                  );
                  return (
                    <CommandItem
                      key={label.value}
                      value={label.value}
                      onSelect={() => toggleLabel(label)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className='flex-1'>{label.label}</div>
                      <div
                        className='h-4 w-4 rounded-full'
                        style={{ backgroundColor: label.color }}
                      />
                    </CommandItem>
                  );
                })}
                <CommandItemCreate
                  onSelect={() => createLabel(inputValue)}
                  {...{ inputValue, labels }}
                />
              </CommandGroup>
              <CommandSeparator alwaysRender />
              <CommandGroup>
                <CommandItem
                  value={`:${inputValue}:`}
                  className='flex items-center justify-center text-xs text-muted-foreground'
                  onSelect={() => setOpenDialog(true)}
                >
                  <Edit className='mr-1 h-2.5 w-2.5' />
                  Edit Labels
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenCombobox(true);
          }
          setOpenDialog(open);
        }}
      >
        <DialogContent className='flex max-h-[90vh] flex-col'>
          <DialogHeader>
            <DialogTitle>Edit Labels</DialogTitle>
            <DialogDescription>
              Edit the label names or remove existing labels. You can create new
              labels using the input field.
            </DialogDescription>
          </DialogHeader>
          <div className='-mx-6 flex-1 overflow-scroll px-6 py-2'>
            {labels.map((label) => {
              return (
                <DialogListItem
                  key={label.value}
                  onDelete={() => deleteLabel(label)}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const target = e.target as typeof e.target &
                      Record<'name' | 'color', { value: string }>;
                    const newLabel = {
                      value: target.name.value.toLowerCase(),
                      label: target.name.value,
                      color: selectedColor || '#000',
                    };
                    updateLabel(label, newLabel);
                  }}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  {...label}
                />
              );
            })}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary' className='rounded-[12px]'>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const CommandItemCreate = ({
  inputValue,
  labels,
  onSelect,
}: {
  inputValue: string;
  labels: LabelType[];
  onSelect: () => void;
}) => {
  const trimmedInputValue = inputValue.trim();
  const hasNoLabel = !labels
    .map(({ value }) => value)
    .includes(trimmedInputValue.toLowerCase());

  const render = trimmedInputValue !== '' && hasNoLabel;

  if (!render) return null;

  return (
    <CommandItem
      key={trimmedInputValue}
      value={trimmedInputValue}
      className='text-xs text-muted-foreground'
      onSelect={onSelect}
    >
      <div className={cn('mr-2 h-4 w-4')} />
      Create new label &quot;{trimmedInputValue}&quot;
    </CommandItem>
  );
};

const DialogListItem = ({
  value,
  label,
  color,
  onSubmit,
  onDelete,
  selectedColor,
  setSelectedColor,
}: LabelType & {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
  selectedColor: string | undefined;
  setSelectedColor: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [accordionValue, setAccordionValue] = React.useState<string>('');
  const [inputValue, setInputValue] = React.useState<string>(label);

  const disabled = label === inputValue && color === selectedColor;

  React.useEffect(() => {
    if (accordionValue !== '') {
      inputRef.current?.focus();
    }
  }, [accordionValue]);

  return (
    <Accordion
      key={value}
      type='single'
      collapsible
      value={accordionValue}
      onValueChange={setAccordionValue}
    >
      <AccordionItem value={value}>
        <AccordionTrigger>
          <div className='flex items-center justify-between'>
            <div>
              <Badge variant='outline' style={badgeStyle(color)}>
                {label}
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form
            className='flex items-end gap-4 pt-2'
            onSubmit={(e) => {
              onSubmit(e);
              setAccordionValue('');
            }}
          >
            <div className='grid w-full gap-2'>
              <Label htmlFor='name'>Label name</Label>
              <Input
                ref={inputRef}
                id='name'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className='h-8 min-h-8'
              />
            </div>
            <div className='flex w-fit gap-1'>
              <ColorDropdown
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              <Button
                type='submit'
                className='rounded-[12px]'
                disabled={disabled}
                size={'sm'}
              >
                Save
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='destructive'
                    size={'icon'}
                    className='size-8 min-h-8 min-w-8 rounded-[12px]'
                  >
                    <Trash className='size-4' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to delete the label{' '}
                      <Badge
                        variant='outline'
                        className='ml-1'
                        style={badgeStyle(color)}
                      >
                        {label}
                      </Badge>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button
                        variant={'secondary'}
                        className='rounded-[12px] border-none'
                      >
                        Cancel
                      </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className='rounded-[12px]'
                      onClick={onDelete}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const badgeStyle = (color: string) => ({
  backgroundColor: `${color}1A`,
  borderColor: `${color}33`,
  color: color,
});
