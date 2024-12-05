import { Card } from '@/components/ui/card';

export default function MetricStats(props: {
  stats: Array<any>;
  className?: string;
}) {
  return (
    <Card
      className={`flex max-lg:grid max-sm:grid-cols-1 max-sm:divide-y max-lg:grid-cols-2 max-lg: max-lg:divide-x-[0] flex-row justify-between gap-[30px] divide-x rounded-2xl border border-input border-b-0 bg-accent rounded-b-none p-5 ${props.className}`}
    >
      {props.stats.map((stat, i) => {
        return (
          <div
            className='flex w-full flex-col gap-0.5 pl-[30px] max-lg:pl-[0] max-sm:pt-5 max-sm:first:pt-0 first:pl-0'
            key={i}
          >
            <div className='text-sm font-medium'>{stat.title}</div>
            <div className='text-xs text-secondary'>{stat.description}</div>
            <div className='mt-[10px] text-3xl font-medium'>{stat.value}</div>
          </div>
        );
      })}
    </Card>
  );
}
