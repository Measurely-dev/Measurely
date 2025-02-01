import { TooltipProps } from '@/components/ui/area-chart';

const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};

export default function CustomTooltip(props: TooltipProps) {
  if (!props.payload) return null;
  return (
    <>
      <div className='w-full rounded-md border border-gray-500/10 bg-black px-4 py-1.5 text-sm shadow-md'>
        <p className='flex w-full items-center justify-between gap-10'>
          <span className='text-gray-50 dark:text-gray-50'> Date </span>
          <span className='font-medium text-gray-50 dark:text-gray-50'>
            {props.payload.length > 0
              ? props.payload[0].payload.metadata.tooltipdate
              : props.label}
          </span>
        </p>
      </div>
      <div className='mt-1 w-full space-y-2 rounded-md border border-gray-500/10 bg-white px-4 py-2 text-sm shadow-md'>
        {props.payload.map((item, i) => {
          return (
            <div className='flex w-full justify-between gap-10' key={i}>
              <span className='flex items-center gap-2 text-gray-700'>
                <div
                  className='size-1.5 rounded-full'
                  style={{ backgroundColor: item.color }}
                />
                {item.category}
              </span>
              <div className='flex items-center space-x-1'>
                <span className='font-medium text-gray-900'>
                  {valueFormatter(item.value)}{' '}
                  {
                    props.payload[0].payload.metadata[
                      `metric_unit_${item.category}`
                    ]
                  }
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
