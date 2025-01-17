import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

export const PushValueDialog = (props: {
  pushValueOpen: boolean;
  setPushValueOpen: (open: boolean) => void;
  metric: Metric;
}) => {
  const { projects, activeProject } = useContext(ProjectsContext);
  const [pushValue, setPushValue] = useState<number | string>(0);
  const [selectedFilterCategory, setSelectedFilterCategory] =
    useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const handlePushValue = () => {
    if (
      pushValue !== null &&
      props.metric &&
      Number(pushValue) &&
      projects[activeProject].userrole !== UserRole.Guest
    ) {

      let body: any= {
        value : pushValue
      }

      if(selectedFilter !== '' && selectedFilterCategory !== '') {
        body.filters = {
          [selectedFilterCategory] : selectedFilter
        }
      }

      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/event/v1/${props.metric.name}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${projects[activeProject].apikey}`,
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
        setPushValue(0);
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
          <Label>Value</Label>
          <Input
            type='number'
            min={0}
            max={1000000000}
            value={pushValue === 0 && !Number(pushValue) ? '' : pushValue}
            onChange={(e) =>
              setPushValue(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder='Enter value...'
            className='h-11 rounded-[12px]'
          />
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
              !Number(pushValue) ||
              pushValue === ''
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
