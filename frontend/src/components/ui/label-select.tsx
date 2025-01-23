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
import { Dispatch, SetStateAction, useContext, useRef, useState } from 'react';
import { ProjectsContext } from '@/dash-context';
import { LabelType, Project } from '@/types';

export function LabelSelect(props: {
  selectedLabel: string;
  setSelectedLabel: Dispatch<SetStateAction<string>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
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
          ? {
              ...proj,
              blocks: {
                ...proj.blocks,
                labels: [
                  ...(proj.blocks?.labels || []),
                  { name: newLabel, defaultcolor: '' },
                ],
                userid: proj.blocks?.user_id || '',
              },
            }
          : proj,
      ) as Project[],
    );
    setInputValue('');
    props.setSelectedLabel(newLabel);
  };

  const toggleLabel = (label: string) => {
    props.setSelectedLabel(label === props.selectedLabel ? '' : label);
    inputRef?.current?.focus();
  };

  const updateLabel = (label: string, newLabel: string) => {
    const labels = projects[activeProject]?.blocks?.labels || [];
    const index = labels.findIndex((l) => l.name === label);
    if (index !== -1) {
      labels[index].name = newLabel;
      setProjects(
        projects.map((proj, i) =>
          i === activeProject
            ? {
                ...proj,
                blocks: {
                  ...proj.blocks,
                  labels,
                  userid: proj.blocks?.user_id || '',
                },
              }
            : proj,
        ) as Project[],
      );
      props.setSelectedLabel(label);
    }
  };

  const deleteLabel = (label: string) => {
    setProjects(
      projects.map((proj, i) =>
        i === activeProject
          ? {
              ...proj,
              blocks: {
                ...proj.blocks,
                labels: proj.blocks?.labels.filter((l) => l.name !== label),
                userid: proj.blocks?.user_id || '',
              },
            }
          : proj,
      ) as Project[],
    );
    if (props.selectedLabel === label) {
      props.setSelectedLabel('');
    }
  };
  
  const getAllLabels = (): LabelType[] => {
    return projects[activeProject]?.blocks?.labels || [];
  };

  return (
    <div className='max-w-full'>
      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
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
                  className='group relative w-fit select-none truncate rounded-full border border-input bg-accent/80 px-3 text-sm font-medium capitalize text-muted-foreground shadow-none'
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
                {getAllLabels().map((label) => (
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
                    <div className='flex-1 capitalize'>{label.name}</div>
                    <div
                      className='h-4 w-4 rounded-full'
                    />
                  </CommandItem>
                ))}
                {inputValue.trim() !== '' &&
                  !getAllLabels().some(
                    (l) => l.name === inputValue.trim().toLowerCase(),
                  ) && (
                    <CommandItem
                      value={inputValue.trim()}
                      className='text-xs text-muted-foreground'
                      onSelect={() => createLabel(inputValue)}
                    >
                      <div className={cn('mr-2 h-4 w-4')} />
                      Create new label &quot;{inputValue.trim()}&quot;
                    </CommandItem>
                  )}
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
        <DialogContent className='flex max-h-[90vh] z-[120] flex-col'>
          <DialogHeader>
            <DialogTitle>Edit Labels</DialogTitle>
            <DialogDescription>
              Edit the label names or remove existing labels. You can create new
              labels using the input field.
            </DialogDescription>
          </DialogHeader>
          <div className='-mx-6 flex-1 overflow-scroll px-6 py-2 capitalize'>
            <Accordion type='single' collapsible>
              {getAllLabels().map((label) => (
                <AccordionItem key={label.name} value={label.name}>
                  <AccordionTrigger>
                    <div className='flex items-center justify-between'>
                      <Badge
                        variant='outline'
                        className='capitalize'
                      >
                        {label.name}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <form
                      className='flex items-end pt-2'
                      onSubmit={(e) => {
                        e.preventDefault();
                        const target = e.target as typeof e.target & {
                          name: { value: string };
                        };
                        updateLabel(
                          label.name,
                          target.name.value.toLowerCase(),
                        );
                      }}
                    >
                      <div className='grid w-full gap-2'>
                        <Label htmlFor='name'>Label name</Label>
                        <Input
                          ref={inputRef}
                          id='name'
                          defaultValue={label.name}
                          autoComplete='off'
                          className='h-10 min-h-10 rounded-[12px] rounded-e-none'
                        />
                      </div>
                      <div className='flex w-fit gap-0'>
                        <Button
                          type='submit'
                          className='h-10 min-h-10 !rounded-[0px]'
                        >
                          Save
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant='destructive'
                              size={'icon'}
                              className='size-10 rounded-[12px] !rounded-s-none'
                            >
                              <Trash className='size-4' />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className='!rounded-[16px]'>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                You are about to delete the label{' '}
                                <Badge
                                  variant='outline'
                                  className='ml-1 capitalize'
                                >
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
                                className='rounded-[12px] bg-destructive hover:bg-destructive/80'
                                onClick={() => deleteLabel(label.name)}
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
              ))}
            </Accordion>
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
