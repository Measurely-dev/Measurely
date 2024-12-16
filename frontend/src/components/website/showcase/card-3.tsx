import { Card } from '@/components/ui/card';

export default function Card3(props: { className?: string }) {
  return (
    <Card className={`w-[320px] z-20 rounded-2xl bg-white shadow-sm ${props.className}`}>
      <div className='flex flex-col items-center justify-center px-4 py-5 text-center'>
        <span className='text-[17px] font-semibold'>
          10 new created accounts
        </span>
        <span className='mt-[4px] text-[13px]'>
          10 new users created accounts on application 'Acme inc'
        </span>
      </div>
      <div className='flex cursor-pointer select-none items-center justify-center border-t py-2 text-[17px] text-blue-500'>
        See more
      </div>
    </Card>
  );
}
