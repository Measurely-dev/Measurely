import {
  Button as AriaButton,
  Group,
  Input as AriaInput,
  NumberField,
} from 'react-aria-components';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useContext, useState } from 'react';
import { Metric, UserRole } from '@/types';
import { ProjectsContext } from '@/dash-context';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react'; // Icons for increment/decrement
import { Button } from '@/components/ui/button';

export const PushValueDialog = (props: {
  pushValueOpen: boolean;
  setPushValueOpen: (open: boolean) => void;
  metric: Metric;
}) => {
  const { projects, activeProject } = useContext(ProjectsContext);
  const [selectedFilterCategory, setSelectedFilterCategory] =
    useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  // State for the number input
  const [numberValue, setNumberValue] = useState<number>(0);

  const handlePushValue = () => {
    if (props.metric && projects[activeProject].user_role !== UserRole.Guest) {
      const body: any = {
        value: numberValue, // Use the number value
      };

      if (selectedFilter !== '' && selectedFilterCategory !== '') {
        body.filters = {
          [selectedFilterCategory]: selectedFilter,
        };
      }

      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/event/v1/${props.metric.name}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${projects[activeProject].api_key}`,
          },
          body: JSON.stringify(body),
        },
      ).then((resp) => {
        if (resp.ok) {
          toast.success('Successfully created new event');
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
        }
      });
      props.setPushValueOpen(false);
    } else {
      toast.error('Please enter a valid value');
    }
  };

  return (
    <Dialog
      open={props.pushValueOpen}
      onOpenChange={(e) => {
        props.setPushValueOpen(e);
        setNumberValue(0); // Reset number value
        setSelectedFilterCategory('');
        setSelectedFilter('');
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Push Value</DialogTitle>
          <DialogDescription>
            Enter a value to push to the metric, modifying the metric's data
            based on your input.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-2'>
          <Label>Number Value</Label>
          <NumberField
            defaultValue={0}
            className='h-11 w-full rounded-[12px]'
            minValue={-1000000000}
            maxValue={1000000000}
            value={numberValue}
            onChange={(e) => setNumberValue(e)}
          >
            <div className='space-y-2'>
              <Group className='relative inline-flex h-11 w-full items-center overflow-hidden whitespace-nowrap rounded-[12px] border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-input data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-input/80'>
                <AriaButton
                  slot='decrement'
                  className='-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Minus
                    className='size-4'
                    strokeWidth={2}
                    aria-hidden='true'
                  />
                </AriaButton>
                <AriaInput className='w-full grow bg-background px-3 py-2 text-center tabular-nums text-foreground focus:outline-none' />
                <AriaButton
                  slot='increment'
                  className='-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Plus className='size-4' strokeWidth={2} aria-hidden='true' />
                </AriaButton>
              </Group>
            </div>
          </NumberField>
        </div>

        <div className='flex flex-col gap-2'>
          <Label>Select filter category</Label>
          <Select
            value={selectedFilterCategory || 'no_category_selected'}
            onValueChange={(value) => {
              setSelectedFilterCategory(value);
              setSelectedFilter('');
            }}
          >
            <SelectTrigger className='h-11 border text-primary'>
              <SelectValue placeholder='Select a filter category' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='no_category_selected'>
                  -- No category --
                </SelectItem>
                {Object.keys(props.metric?.filters || {}).length !== 0 ? (
                  <>
                    <SelectSeparator />
                    <SelectLabel>Filter categories</SelectLabel>
                    {Object.keys(props.metric?.filters || {}).map(
                      (category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ),
                    )}
                  </>
                ) : null}
              </SelectGroup>
            </SelectContent>
          </Select>

          {selectedFilterCategory &&
          selectedFilterCategory !== 'no_category_selected' ? (
            <>
              <Label className='mt-2'>Select filter</Label>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className='h-11 border text-primary'>
                  <SelectValue placeholder='Select a filter' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filters</SelectLabel>
                    {props.metric.filters[selectedFilterCategory].map(
                      (filter, i) => (
                        <SelectItem key={i} value={filter.name}>
                          {filter.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </>
          ) : null}

          <Label className='text-xs font-normal text-secondary'>
            Filters modify the metric's data by applying specific criteria
            before pushing a new value.
          </Label>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button className='w-fit rounded-[12px]' variant='secondary'>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={
              (selectedFilterCategory !== 'no_category_selected' &&
                selectedFilterCategory !== '' &&
                selectedFilter === '') ||
              numberValue === 0 // Disable if numberValue is 0
            }
            className='w-fit rounded-[12px]'
            onClick={handlePushValue}
          >
            Push
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
