import { Card } from '@/components/ui/card';

export default function MetricStats(props: {
  stats: Array<any>;
  className?: string;
}) {
  return (
    <Card
      className={`flex flex-row justify-between gap-[30px] divide-x rounded-none border-none bg-accent p-5 max-lg:grid max-lg:grid-cols-2 max-lg:divide-x-[0] max-sm:grid-cols-1 max-sm:divide-y ${props.className}`}
    >
      {props.stats.map((stat, i) => {
        return (
          <div
            className='flex w-full flex-col gap-0.5 pl-[30px] first:pl-0 max-lg:pl-[0] max-sm:pt-5 max-sm:first:pt-0'
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
