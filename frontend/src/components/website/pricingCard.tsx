import { Button } from '@/components/ui/button';
import { CheckIcon } from '@radix-ui/react-icons';

interface WebPricingCardProps {
  className?: string;
  name: string;
  description: string;
  price: number | 'custom';
  recurrence: string;
  target: string;
  list: Array<any>;
  button?: string;
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
  ...additionalProps // Destructure additional props here
}) => {
  return (
    <div
      {...additionalProps} // Spread additionalProps here
      className={`flex w-full flex-col gap-[10px] rounded-[30px] bg-accent px-[30px] py-[50px] ${className}`}
    >
      <div className='text-2xl font-medium'>{name}</div>
      <div className='mb-auto text-xs font-normal'>{description}</div>
      <div className='mt-5 flex flex-row items-end gap-[5px]'>
        {price === 'custom' ? (
          <div className='text-3xl font-semibold leading-none'>Custom</div>
        ) : (
          <>
            <div className='text-3xl font-semibold leading-none'>${price}</div>
            <div className='text-xs text-secondary'>
              {recurrence === 'month' ? 'USD per month' : 'forever'}
            </div>
          </>
        )}
      </div>
      <div className='mt-5 flex flex-col gap-[10px]'>
        <div className='mb-[10px] text-sm font-semibold'>For {target}</div>
        {list.map((listItem, i) => {
          return (
            <div className='flex flex-row items-center gap-[10px]' key={i}>
              <div className='flex size-[25px] items-center justify-center rounded-[8px] bg-background'>
                <CheckIcon className='size-[16px] text-secondary' />
              </div>
              <div className='text-sm font-semibold text-secondary'>
                {listItem.name}
              </div>
            </div>
          );
        })}
      </div>
      {button ? (
        <Button className='mt-[30px] w-fit rounded-[12px]'>{button}</Button>
      ) : (
        <></>
      )}
    </div>
  );
};
export default WebPricingCard;
