'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Edit, Trash } from 'lucide-react';

import { cn } from '@/lib/utils';
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
import { Dispatch, SetStateAction, useContext } from 'react';
import { ProjectsContext } from '@/dash-context';
import { LabelType } from '@/types';

export function LabelSelect(props: {
  selectedLabel: string;
  setSelectedLabel: Dispatch<SetStateAction<string>>;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');

  const { projects, setProjects, activeProject } = useContext(ProjectsContext);

  const createLabel = (name: string) => {
    const isValid = /^[a-zA-Z0-9\s-_]+$/.test(name);

    if (!isValid) {
      toast.error('Please choose a valid label.');
      return;
    }

    const newLabel = name.trim().toLowerCase();

    setProjects(
      projects.map((proj, i) =>
        i === activeProject
          ? Object.assign({}, proj, {
            blocks: Object.assign({}, proj.blocks, {
              labels: [
                ...(proj.blocks === null ? [] : proj.blocks?.labels),
                { name: newLabel, defaultcolor: '' },
              ],
            }),
          })
          : proj,
      ),
    );

    setInputValue('');
    props.setSelectedLabel(newLabel);
  };

  const toggleLabel = (label: string) => {
    if (label === props.selectedLabel) {
      props.setSelectedLabel('');
    } else {
      props.setSelectedLabel(label);
    }
    inputRef?.current?.focus();
  };

  const updateLabel = (label: string, newLabel: string) => {
    const labels =
      projects[activeProject].blocks === null
        ? []
        : [...projects[activeProject].blocks.labels];
    const index = labels.findIndex((l) => l.name === label);
    if (index !== -1) {
      labels[index].name = newLabel;
      setProjects(
        projects.map((proj, i) =>
          i === activeProject
            ? Object.assign({}, proj, {
              labels: labels,
            })
            : proj,
        ),
      );
      props.setSelectedLabel(label);
    }
  };

  const deleteLabel = (label: string) => {
    setProjects(
      projects.map((proj, i) =>
        i === activeProject
          ? Object.assign({}, proj, {
            labels: proj.blocks?.labels.filter((l) => l.name !== label),
          })
          : proj,
      ),
    );

    if (props.selectedLabel === label) {
      props.setSelectedLabel('');
    }
  };

  const onComboboxOpenChange = (value: boolean) => {
    inputRef.current?.blur();
    setOpenCombobox(value);
  };

  const getColorByLabel = (label: string): string => {
    const index =
      projects[activeProject].blocks?.labels.findIndex(
        (l) => l.name === label,
      ) ?? -1;
    if (index === -1) {
      return '';
    }
    return projects[activeProject].blocks?.labels[index].defaultcolor ?? '';
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
              {props.selectedLabel === '' ? (
                'Select a label'
              ) : (
                <Badge
                  variant='outline'
                  className='truncate'
                  style={badgeStyle(getColorByLabel(props.selectedLabel))}
                >
                  {props.selectedLabel}
                </Badge>
              )}
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
                {projects[activeProject].blocks?.labels.map((label) => {
                  return (
                    <CommandItem
                      key={label.name}
                      value={label.name}
                      onSelect={() => toggleLabel(label.name)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          props.selectedLabel === label.name
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      <div className='flex-1'>{label.name}</div>
                      <div
                        className='h-4 w-4 rounded-full'
                        style={{ backgroundColor: label.defaultcolor }}
                      />
                    </CommandItem>
                  );
                })}
                <CommandItemCreate
                  onSelect={() => createLabel(inputValue)}
                  {...{ inputValue }}
                  labels={projects[activeProject].blocks?.labels ?? []}
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
            {projects[activeProject].blocks?.labels.map((label) => {
              return (
                <DialogListItem
                  key={label.name}
                  label={label}
                  onDelete={() => deleteLabel(label.name)}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const target = e.target as typeof e.target &
                      Record<'name' | 'color', { value: string }>;
                    updateLabel(label.name, target.name.value.toLowerCase());
                  }}
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
  onSelect,
  labels,
}: {
  inputValue: string;
  onSelect: () => void;
  labels: LabelType[];
}) => {
  if (
    inputValue.trim() === '' ||
    labels.findIndex((l) => l.name === inputValue.trim().toLowerCase()) !== -1
  ) {
    return;
  }

  return (
    <CommandItem
      value={inputValue.trim()}
      className='text-xs text-muted-foreground'
      onSelect={onSelect}
    >
      <div className={cn('mr-2 h-4 w-4')} />
      Create new label &quot;{inputValue.trim()}&quot;
    </CommandItem>
  );
};

const DialogListItem = ({
  label,
  onSubmit,
  onDelete,
}: {
  label: LabelType;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [accordionValue, setAccordionValue] = React.useState<string>('');
  const [inputValue, setInputValue] = React.useState<string>(label.name);

  const disabled = label.name === inputValue;

  React.useEffect(() => {
    if (accordionValue !== '') {
      inputRef.current?.focus();
    }
  }, [accordionValue]);

  return (
    <Accordion
      key={label.name}
      type='single'
      collapsible
      value={accordionValue}
      onValueChange={setAccordionValue}
    >
      <AccordionItem value={label.name}>
        <AccordionTrigger>
          <div className='flex items-center justify-between'>
            <div>
              <Badge variant='outline' style={badgeStyle(label.defaultcolor)}>
                {label.name}
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
                      <Badge variant='outline' className='ml-1'>
                        {label.name}
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
