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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ShowcaseCursor from './cursor';

export default function Card2(props: { className?: string }) {
  return (
    <Card className={`w-[320px] rounded-2xl p-5 shadow-sm ${props.className}`}>
      <ShowcaseCursor cursor={1} className='!absolute top-[-26px] !rotate-[-7deg] left-[135px]' />

      <CardHeader className='p-0'>
        <CardTitle>New ticket</CardTitle>
        <CardDescription className='text-xs'>
          By creating a ticket, you send a request to the owner of this project.
        </CardDescription>
      </CardHeader>
      <CardContent className='mt-5 flex w-full flex-col gap-3 p-0'>
        <div className='grid w-full items-center gap-1'>
          <Label htmlFor='Title' className='text-xs'>
            Subject
          </Label>
          <Input
            type='text'
            placeholder='Title'
            defaultValue='New website design'
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
            defaultValue='Designing a mood board in figma to brainstorm ideas'
            className='text-xs placeholder:text-xs'
          />
        </div>
        <Select>
          <SelectTrigger className='h-[30px] rounded-[6px] border text-xs text-primary'>
            <SelectValue placeholder='Select a priority' />
          </SelectTrigger>
          <SelectContent className='rotate-[7deg] max-lg:rotate-0'>
            <SelectGroup>
              <SelectItem value='high'>High</SelectItem>
              <SelectItem value='medium'>Medium</SelectItem>
              <SelectItem value='low'>Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button className='w-full' size='sm'>
          Create milestone
        </Button>
      </CardContent>
    </Card>
  );
}
