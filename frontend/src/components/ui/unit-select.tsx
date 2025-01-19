import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface UnitSelectProps {
  onValueChange: (value: string) => void;
}

export function UnitSelect({ onValueChange }: UnitSelectProps) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger noIcon className='h-fit bg-blue-500 p-0'>
        <div className='flex cursor-pointer select-none items-center gap-1 rounded-[8px] bg-accent p-1 px-2 !text-sm !font-normal !text-muted-foreground'>
          <SelectValue placeholder='Unit' />
          <ChevronDown className='size-3' />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Basic units</SelectLabel>
          <SelectItem value='visitors'>Visitors</SelectItem>
          <SelectItem value='clients'>Clients</SelectItem>
          <SelectItem value='requests'>Requests</SelectItem>
          <SelectItem value='sessions'>Sessions</SelectItem>
          <SelectItem value='views'>Page Views</SelectItem>
          <SelectItem value='clicks'>Clicks</SelectItem>
          <SelectItem value='impressions'>Impressions</SelectItem>
          <SelectItem value='bounce-rate'>Bounce Rate (%)</SelectItem>
          <SelectItem value='conversion-rate'>Conversion Rate (%)</SelectItem>
          <SelectItem value='load-time'>Load Time (ms)</SelectItem>
          <SelectItem value='uptime'>Uptime (%)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Data units</SelectLabel>
          <SelectItem value='bytes'>Bytes (B)</SelectItem>
          <SelectItem value='kilobytes'>Kilobytes (KB)</SelectItem>
          <SelectItem value='megabytes'>Megabytes (MB)</SelectItem>
          <SelectItem value='gigabytes'>Gigabytes (GB)</SelectItem>
          <SelectItem value='terabytes'>Terabytes (TB)</SelectItem>
          <SelectItem value='requests-per-second'>
            Requests per Second (RPS)
          </SelectItem>
          <SelectItem value='api-calls'>API Calls</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>User Engagement units</SelectLabel>
          <SelectItem value='active-users'>Active Users</SelectItem>
          <SelectItem value='new-users'>New Users</SelectItem>
          <SelectItem value='returning-users'>Returning Users</SelectItem>
          <SelectItem value='average-session-duration'>
            Avg. Session Duration (mins)
          </SelectItem>
          <SelectItem value='time-on-page'>Time on Page (secs)</SelectItem>
          <SelectItem value='engagement-rate'>Engagement Rate (%)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Monetary units</SelectLabel>
          <SelectItem value='money-cad'>CAD ($)</SelectItem>
          <SelectItem value='money-usd'>USD ($)</SelectItem>
          <SelectItem value='money-eur'>EUR (€)</SelectItem>
          <SelectItem value='money-gbp'>GBP (£)</SelectItem>
          <SelectItem value='money-jpy'>JPY (¥)</SelectItem>
          <SelectItem value='money-aud'>AUD ($)</SelectItem>
          <SelectItem value='money-nzd'>NZD ($)</SelectItem>
          <SelectItem value='money-chf'>CHF (CHF)</SelectItem>
          <SelectItem value='money-cny'>CNY (¥)</SelectItem>
          <SelectItem value='money-inr'>INR (₹)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Performance units</SelectLabel>
          <SelectItem value='cpu-usage'>CPU Usage (%)</SelectItem>
          <SelectItem value='memory-usage'>Memory Usage (MB)</SelectItem>
          <SelectItem value='disk-space'>Disk Space (GB)</SelectItem>
          <SelectItem value='latency'>Latency (ms)</SelectItem>
          <SelectItem value='error-rate'>Error Rate (%)</SelectItem>
          <SelectItem value='throughput'>Throughput (ops/sec)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
