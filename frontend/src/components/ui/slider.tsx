'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

interface SliderNewProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showSteps?: string;
  formatLabel?: (value: number) => string;
  formatLabelSide?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderNewProps
>(
  (
    {
      className,
      showSteps = 'none',
      formatLabel,
      formatLabelSide = 'top',
      ...props
    },
    ref,
  ) => {
    const {
      min = 0,
      max = 100,
      step = 1,
      orientation,
      value,
      defaultValue,
      onValueChange,
    } = props;
    const numberOfSteps = Math.floor((max - min) / step);
    const stepLines = Array.from(
      { length: numberOfSteps },
      (_, index) => index * step + min,
    );

    const initialValue = Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max];
    const [localValues, setLocalValues] =
      React.useState<number[]>(initialValue);

    React.useEffect(() => {
      if (!isEqual(value, localValues)) {
        setLocalValues(
          Array.isArray(value)
            ? value
            : Array.isArray(defaultValue)
              ? defaultValue
              : [min, max],
        );
      }
    }, [min, max, value]);

    const handleValueChange = (newValues: number[]) => {
      setLocalValues(newValues);
      if (onValueChange) {
        onValueChange(newValues);
      }
    };

    function isEqual(
      array1: number[] | undefined,
      array2: number[] | undefined,
    ) {
      array1 = array1 ?? [];
      array2 = array2 ?? [];

      if (array1.length !== array2.length) {
        return false;
      }

      for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
          return false;
        }
      }

      return true;
    }

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex cursor-pointer touch-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          "data-[orientation='horizontal']:w-full data-[orientation='horizontal']:items-center",
          "data-[orientation='vertical']:h-full data-[orientation='vertical']:justify-center",
          className,
        )}
        min={min}
        max={max}
        step={step}
        value={localValues}
        onValueChange={(value) => handleValueChange(value)}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative grow overflow-hidden rounded-full bg-accent',
            "data-[orientation='horizontal']:h-4 data-[orientation='horizontal']:w-full",
            "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-2",
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              'absolute bg-primary',
              "data-[orientation='horizontal']:h-full",
              "data-[orientation='vertical']:w-full",
            )}
          />
          {showSteps !== undefined &&
            showSteps !== 'none' &&
            stepLines.map((value, index) => {
              if (value === min || value === max) {
                return null;
              }
              const positionPercentage = ((value - min) / (max - min)) * 100;
              const adjustedPosition = 50 + (positionPercentage - 50) * 0.96;
              return (
                <div
                  key={index}
                  className={cn(
                    {
                      'h-2 w-0.5': orientation !== 'vertical',
                      'h-0.5 w-2': orientation === 'vertical',
                    },
                    'absolute bg-input',
                    {
                      'left-1':
                        orientation === 'vertical' && showSteps === 'half',
                      'top-1':
                        orientation !== 'vertical' && showSteps === 'half',
                      'left-0':
                        orientation === 'vertical' && showSteps === 'full',
                      'top-0':
                        orientation !== 'vertical' && showSteps === 'full',
                      '-translate-x-1/2 transform': orientation !== 'vertical',
                      '-translate-y-1/2 transform': orientation === 'vertical',
                    },
                  )}
                  style={{
                    [orientation === 'vertical' ? 'bottom' : 'left']:
                      `${adjustedPosition}%`,
                  }}
                />
              );
            })}
        </SliderPrimitive.Track>
        {localValues.map((numberStep, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={cn(
              'block h-6 w-6 rounded-full border-2 border-primary bg-background transition-colors',
            )}
          >
            <div
              className={cn(
                {
                  'bottom-8 left-1/2 -translate-x-1/2 transform':
                    formatLabelSide === 'top',
                },
                {
                  'left-1/2 top-8 -translate-x-1/2 transform':
                    formatLabelSide === 'bottom',
                },
                {
                  'right-8 -translate-y-1/4 transform':
                    formatLabelSide === 'left',
                },
                {
                  'left-8 -translate-y-1/4 transform':
                    formatLabelSide === 'right',
                },
                'absolute z-30 w-max animate-gradient items-center justify-items-center overflow-hidden rounded-[12px] border bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text px-3 py-1 text-center font-medium text-transparent shadow-sm',
              )}
            >
              {formatLabel && formatLabel(numberStep)}
            </div>
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
    );
  },
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
