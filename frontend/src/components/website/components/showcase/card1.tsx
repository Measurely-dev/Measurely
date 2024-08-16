import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Card1(props: { className?: string }) {
  return (
    <Card className={`w-[340px] rounded-2xl p-5 shadow-sm ${props.className}`}>
      <CardHeader className='p-0'>
        <CardTitle>New milestone</CardTitle>
        <CardDescription className='text-xs'>
          By creating a milestone, you send a step request to the client of this
          project.
        </CardDescription>
      </CardHeader>
      <CardContent className='mt-5 flex w-full flex-col gap-3 p-0'>
        <div className='grid w-full items-center gap-1'>
          <Label htmlFor='Title' className='text-xs'>
            Title
          </Label>
          <Input
            type='text'
            placeholder='Title'
            className='text-xs placeholder:text-xs'
          />
        </div>
        <div className='grid w-full items-center gap-1'>
          <Label htmlFor='Title' className='text-xs'>
            Description
          </Label>
          <Input
            type='text'
            placeholder='Descripiton'
            className='text-xs placeholder:text-xs'
          />
        </div>
        <Button className='w-full' size='sm'>
          Create milestone
        </Button>
      </CardContent>
    </Card>
  );
}
