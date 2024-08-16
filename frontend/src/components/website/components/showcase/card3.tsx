import { Card } from '@/components/ui/card';

export default function Card3(props: { className?: string }) {
  return (
    <Card className={`w-[320px] rounded-2xl shadow-sm ${props.className}`}>
      <div className='flex flex-col items-center justify-center px-4 py-5 text-center'>
        <span className='text-[17px] font-semibold'>
          Jane Doe Is Spamming You With Email Do You Want To Block Her?
        </span>
        <span className='mt-[4px] text-[13px]'>
          By blocking her you accept to start using Measurably to manage you’re
          clients.
        </span>
      </div>
      <div className='flex cursor-pointer select-none items-center justify-center border-t py-2 text-[17px] text-blue-500'>
        Block
      </div>
    </Card>
  );
}
