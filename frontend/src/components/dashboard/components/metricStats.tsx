import { Card } from '@/components/ui/card';

export default function MetricStats(props: {
  stats: Array<any>;
  className?: string;
}) {
  return (
    <Card
      className={`flex flex-row justify-between gap-[30px] divide-x rounded-2xl border-none bg-accent rounded-b-none p-5 ${props.className}`}
    >
      {props.stats.map((stat, i) => {
        return (
          <div
            className='flex w-full flex-col gap-0.5 pl-[30px] first:pl-0'
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
