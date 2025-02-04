// Import UI components
import { Card } from '@/components/ui/card';
import { Progress } from './ui/progress';

// MetricStats component displays an array of statistics with optional progress bars
export default function MetricStats(props: {
  stats: Array<{
    used?: number;        // Current usage value
    total?: number;       // Maximum value
    title: string;        // Stat title
    description: string;  // Stat description
    value?: string | number; // Alternative display value if not showing progress
  }>;
  className?: string;     // Optional CSS class
  differ?: boolean;       // Layout variation flag
}) {
  // Calculate percentage for progress bar
  const calculateProgress = (used?: number, total?: number) =>
    total && used !== undefined ? Math.round((used / total) * 100) : 0;

  return (
    <Card
      className={`flex flex-row justify-between gap-[30px] divide-x rounded-none border-none bg-accent p-5 max-lg:grid max-lg:grid-cols-2 max-lg:divide-x-[0] max-sm:grid-cols-1 max-sm:divide-y ${props.className}`}
    >
      {/* Map through stats array to render each stat */}
      {props.stats.map((stat, i) => {
        const progressValue = calculateProgress(stat.used, stat.total);

        return (
          <div
            className={`${
              props.differ ? 'my-2' : 'pl-[30px] max-lg:pl-[0]'
            } flex w-full flex-col gap-0.5 first:pl-0 max-sm:pt-5 max-sm:first:pt-0`}
            key={i}
          >
            {/* Stat header */}
            <div className='text-sm font-medium'>{stat.title}</div>
            <div className='text-xs text-muted-foreground'>
              {stat.description}
            </div>

            {/* Render either progress bar or simple value */}
            {stat.total && stat.used !== undefined ? (
              <div className='flex flex-col gap-2 font-mono'>
                <Progress
                  value={progressValue}
                  className='mt-[10px] h-[5px] w-full bg-input'
                />
                <div className='text-sm text-muted-foreground'>
                  <span className='text-primary'>{stat.used}</span>/{stat.total}
                </div>
              </div>
            ) : (
              <div className='mt-[10px] text-3xl font-medium'>
                {stat.value !== undefined ? stat.value : 'N/A'}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}
