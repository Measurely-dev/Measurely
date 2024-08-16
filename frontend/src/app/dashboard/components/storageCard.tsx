import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function StorageCard(props: { className?: string }) {
  return (
    <Card
      className={`flex flex-col gap-[10px] rounded-2xl border-none bg-accent p-5 ${props.className}`}
    >
      <div className='flex flex-col gap-[5px]'>
        <div className='text-base font-medium'>Used storage</div>
        <div className='text-xs text-secondary'>
          Each team as a storage limit, you can add more storage
        </div>
      </div>
      <div className='flex w-full flex-row items-center justify-between gap-10'>
        <div className='flex w-full flex-col justify-center gap-1'>
          <div className='text-xs text-secondary'><span className='text-primary font-semibold'>8.02GB</span> used out of 10GB</div>
          <div className='h-[6px] w-full overflow-hidden rounded-full bg-input'>
            <div className='h-full w-[62.45%] bg-blue-300' />
          </div>
        </div>
        <Button className='rounded-[12px]'>Add storage</Button>
      </div>
    </Card>
  );
}
