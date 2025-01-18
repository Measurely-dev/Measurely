import { Button } from '@/components/ui/button';
import { CheckIcon } from '@radix-ui/react-icons';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface WebPricingCardProps {
  className?: string;
  name: string;
  description: string;
  price?: number | 'custom pricing';
  recurrence: string;
  target?: string;
  list?: Array<ReactNode>;
  button?: string;
  disabled?: boolean | false;
  sliderValue?: string | 0;
  popular?: boolean | false;
  [key: string]: any; // Accept any additional props
}

const WebPricingCard: React.FC<WebPricingCardProps> = ({
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
  return (
    <div
      {...additionalProps}
      className={`relative flex w-full flex-col gap-[10px] rounded-[30px] bg-accent px-[30px] py-[50px] ${className} ${popular ? 'rounded-tl-2xl' : ''}`}
    >
      {popular ? (
        <div className='absolute -left-[8px] -top-[8px] flex items-center gap-2 rounded-[20px] rounded-bl-none rounded-tr-none border border-purple-200 bg-purple-50 px-2.5 py-1.5'>
          <Sparkles className='size-4 text-purple-500' />
          <div className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono font-bold text-transparent'>
            Popular
          </div>
        </div>
      ) : (
        ''
      )}
      <div className='text-2xl font-medium'>{name}</div>
      <div className='mb-auto text-xs font-normal'>
        {description}
        <div className='mt-5 flex flex-row items-end gap-[5px]'>
          {price === 'custom pricing' ? (
            <div className='text-3xl font-semibold leading-none'>
              Custom pricing
            </div>
          ) : (
            <>
              <div className='text-3xl font-semibold leading-none'>
                {name === 'Starter' ? (
                  'Free'
                ) : recurrence === 'year' ? (
                  <>
                    <span className='line-through'>
                      ${Math.round((price || 0) * 1.2)}
                    </span>
                    <span className='ml-2 animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono font-bold text-transparent'>
                      ${Math.round(price || 0)}{' '}
                    </span>
                  </>
                ) : (
                  `$${Math.round(price || 0)}`
                )}
              </div>

              <div className='text-xs text-secondary'>
                {recurrence === 'month'
                  ? 'USD per month'
                  : recurrence === 'year'
                    ? 'USD per year'
                    : 'forever'}
              </div>
            </>
          )}
        </div>
      </div>
      <div className='mt-5 flex flex-col gap-4'>
        {sliderValue ? (
          <>
            {name === 'Starter' ? undefined : (
              <>
                <div className='flex flex-row items-center gap-[10px]'>
                  <div className='text-sm font-medium text-secondary'>
                    Up to{' '}
                    <span className='mx-1 animate-gradient rounded-[6px] border bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text px-2 py-1 font-mono text-base font-bold text-transparent'>
                      {sliderValue}
                    </span>{' '}
                    events per month
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <></>
        )}
        <div className='mb-[10px] text-sm font-semibold'>For {target}</div>
        {list?.map((listItem, i) => {
          return (
            <div className='flex flex-row items-center gap-[10px]' key={i}>
              <div className='flex size-[20px] min-h-[20px] min-w-[20px] items-center justify-center rounded-[6px] bg-background'>
                <CheckIcon className='size-[14px] text-secondary' />
              </div>
              <div className='text-sm font-medium text-secondary'>
                {listItem}
              </div>
            </div>
          );
        })}
      </div>

      {name === 'Entreprise' ? (
        <>
          <Link href='mailto:info@measurely.dev' className='w-fit'>
            <Button
              className={`mt-[30px] w-fit rounded-[12px]`}
              disabled={disabled}
            >
              {button}
            </Button>
          </Link>
        </>
      ) : button ? (
        <Button
          className={`mt-[30px] w-fit rounded-[12px]`}
          disabled={disabled}
          loading={loading}
          onClick={onSelect}
        >
          {button}
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};
export default WebPricingCard;
