import { Slider } from '../ui/slider';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Dispatch, SetStateAction } from 'react';

interface PricingOptionsProps {
  sliderValue: number[];
  setSliderValue: (value: number[]) => void;
  billingPeriod: 'month' | 'year';
  setBillingPeriod: Dispatch<SetStateAction<'month' | 'year'>>;
  getEventAmount: (value: number) => string;
  type?: 'page' | 'dialog';
}

export const PricingOptions = ({
  sliderValue,
  setSliderValue,
  billingPeriod,
  setBillingPeriod,
  getEventAmount,
  type = 'page',
}: PricingOptionsProps) => {
  return (
    <div
      className={
        type !== 'page'
          ? 'mb-4 flex flex-row items-end justify-between gap-2 px-5'
          : ''
      }
    >
      <div
        className={`flex w-full max-w-[400px] flex-row items-center gap-4 ${type === 'dialog' ? 'mt-10' : 'mx-auto mt-[40px]'}`}
      >
        <span className='font-mono text-sm font-medium text-primary'>10K</span>
        <Slider
          defaultValue={[0]}
          max={100}
          step={10}
          value={sliderValue}
          onValueChange={(e) => setSliderValue(e)}
          formatLabel={(value) =>
            getEventAmount(value) === '10M+'
              ? `${getEventAmount(value)} events`
              : `Up to ${getEventAmount(value)} events`
          }
        />
        <span className='font-mono text-sm font-medium text-primary'>10M+</span>
      </div>
      <ToggleGroup
        type='single'
        variant='default'
        className={
          type === 'dialog'
            ? 'w-fit rounded-[12px] bg-accent p-1'
            : 'mx-auto my-[30px] w-fit rounded-[12px] bg-accent p-1'
        }
        onValueChange={(value) => {
          if (value !== billingPeriod) {
            setBillingPeriod(value === 'year' ? 'year' : 'month');
          }
        }}
        value={billingPeriod}
      >
        <ToggleGroupItem
          value='month'
          className='rounded-[10px] data-[state=on]:!bg-background'
        >
          Monthly
        </ToggleGroupItem>
        <ToggleGroupItem
          value='year'
          className='flex items-center rounded-[10px] data-[state=on]:!bg-background'
        >
          Yearly
          <span className='bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
            -20%
          </span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
