import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card
      className={`z-[5] w-[320px] rounded-2xl bg-background p-5 shadow-sm ${props.className}`}
    >
      <ShowcaseCursor
        cursor={1}
        className='!absolute left-[135px] top-[-26px] !rotate-[-9deg] max-lg:hidden'
      />
      <CardHeader className='p-0'>
        <CardTitle>New metric</CardTitle>
      </CardHeader>
      <CardContent className='mt-5 flex w-full flex-col gap-3 p-0'>
        <div className='grid w-full items-center gap-1'>
          <Label htmlFor='Title' className='text-xs'>
            Metric name
          </Label>
          <Input
            type='text'
            placeholder='Title'
            defaultValue='Users count'
            className='text-xs placeholder:text-xs'
          />
        </div>
        <div className='grid w-full items-center gap-1'>
          <Label htmlFor='Title' className='text-xs'>
            Base value
          </Label>
          <Input
            type='number'
            placeholder='Value'
            defaultValue='584'
            className='text-xs placeholder:text-xs'
          />
        </div>
        <div className='grid w-full items-center gap-1'>
          <Label htmlFor='Title' className='text-xs'>
            Type
          </Label>
          <Select>
            <SelectTrigger className='h-[30px] rounded-[6px] border text-xs text-primary'>
              <SelectValue placeholder='Select a type' />
            </SelectTrigger>
            <SelectContent className='rotate-[7deg] max-lg:rotate-0'>
              <SelectGroup>
                <SelectItem value='high'>Basic metric</SelectItem>
                <SelectItem value='medium'>Dual variable metric</SelectItem>
                <SelectItem value='low'>Multi-metric</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button className='w-full' size='sm'>
          Create metric
        </Button>
      </CardContent>
    </Card>
  );
}
