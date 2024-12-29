import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
export default function Card2(props: { className?: string }) {
  return (
    <Card className={`w-[320px] rounded-2xl bg-background p-5 shadow-sm ${props.className}`}>
      <CardHeader className='p-0'>
        <CardTitle>New metric</CardTitle>
        <CardDescription className='text-xs'>
          Deleting a metrics is a irreversible action, think before doing it.
        </CardDescription>
      </CardHeader>
      <CardContent className='mt-5 flex w-full flex-col gap-3 p-0'>
        <div className='grid w-full items-center gap-1'>
          <Label htmlFor='Title' className='text-xs'>
            Title
          </Label>
          <Input
            type='text'
            placeholder='Confirm metric name...'
            className='text-xs placeholder:text-xs'
          />
        </div>
        <Button
          className='w-full bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500'
          variant={'destructiveOutline'}
          size='sm'
        >
          Delete metric
        </Button>
      </CardContent>
    </Card>
  );
}
