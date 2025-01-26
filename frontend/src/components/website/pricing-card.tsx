// Import required components and types
import { Button } from '@/components/ui/button';
import { CheckIcon } from '@radix-ui/react-icons';
import { Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

// Define props interface for PricingCard component
interface PricingCardProps {
  className?: string;          // Optional CSS class name
  name: string;                // Name of the pricing tier
  description: string;         // Description text
  price?: number | 'custom pricing'; // Price amount or custom pricing text
  recurrence: string;          // Billing frequency (month/year)
  target?: string;             // Target audience text
  list?: Array<ReactNode>;     // List of features
  button?: string;             // Button text
  disabled?: boolean;          // Disable button state
  sliderValue?: string | number; // Value for usage slider
  popular?: boolean;           // Show popular badge
  loading?: boolean;           // Loading state for button
  onSelect?: () => void;       // Button click handler
}

// PricingCard component - displays a pricing tier card with features and pricing details
const PricingCard: React.FC<PricingCardProps> = ({
  className,
  name,
  description,
  price,
  recurrence,
  target,
  list,
  button,
  disabled,
  loading,
  onSelect,
  sliderValue,
  popular,
  ...additionalProps
}) => {
  // Determine pricing tier type and billing frequency
  const isFree = name === 'Starter';
  const isYearly = recurrence === 'year';
  const isMonthly = recurrence === 'month';

  return (
    <div
      {...additionalProps}
      className={`relative flex w-full flex-col gap-[10px] rounded-[16px] border px-[30px] py-[50px] shadow-sm shadow-black/5 ${className} ${popular ? 'rounded-tl-2xl' : ''}`}
    >
      {/* Popular badge */}
      {popular && (
        <div className='absolute -left-[8px] -top-[8px] flex items-center gap-2 rounded-[20px] rounded-bl-none rounded-br-[12px] rounded-tr-none border border-purple-200 bg-purple-50 px-2.5 py-1.5'>
          <Sparkles className='size-4 text-purple-500' />
          <div className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono font-bold text-transparent'>
            Popular
          </div>
        </div>
      )}

      {/* Tier name and description */}
      <div className='text-2xl font-medium'>{name}</div>
      <div className='mb-auto text-xs font-normal'>{description}</div>

      {/* Price display section */}
      <div className='mt-5 flex flex-row items-end gap-[5px]'>
        {price === 'custom pricing' ? (
          <div className='text-3xl font-semibold leading-none'>
            Custom pricing
          </div>
        ) : (
          <>
            <div className='text-3xl font-semibold leading-none'>
              {isFree ? 'Free' : `$${Math.round(price || 0)}`}
            </div>
            <div className='text-xs text-secondary'>
              {isMonthly
                ? 'USD per month'
                : isYearly
                  ? 'USD per year'
                  : 'forever'}
            </div>
          </>
        )}
      </div>

      {/* Usage limit slider (if applicable) */}
      {sliderValue && !isFree && (
        <div className='mt-5 flex flex-row items-center gap-[10px]'>
          <div className='text-sm font-medium text-secondary'>
            Up to{' '}
            <span className='mx-1 rounded-[6px] bg-accent px-2 py-1 font-mono text-base font-bold text-primary'>
              {sliderValue}
            </span>{' '}
            events per month
          </div>
        </div>
      )}

      {/* Features list section */}
      <div className='mt-5 flex flex-col gap-4'>
        {target && <div className='text-sm font-semibold'>For {target}</div>}
        {list?.map((listItem, i) => (
          <div className='flex flex-row items-center gap-[10px]' key={i}>
            <div className='flex size-[20px] min-h-[20px] min-w-[20px] items-center justify-center rounded-[6px] bg-accent'>
              <CheckIcon className='size-[14px] text-secondary' />
            </div>
            <div className='text-sm font-medium text-secondary'>{listItem}</div>
          </div>
        ))}
      </div>

      {/* Action button */}
      {button && (
        <Button
          className='mt-[30px] w-fit rounded-[12px]'
          disabled={disabled}
          loading={loading}
          onClick={onSelect}
        >
          {button}
        </Button>
      )}
    </div>
  );
};

export default PricingCard;
