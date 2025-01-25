import Image, { StaticImageData } from 'next/image';

export default function WebBentoBox(props: {
  className?: string;
  type: 'horizontal-left' | 'horizontal-right' | 'vertical';
  title: string;
  description: string;
  img: string | StaticImageData;
}) {
  const render = () => {
    switch (props.type) {
      case 'horizontal-left':
        return (
          <div
            className={`grid w-full grid-cols-[4fr,1fr] overflow-hidden rounded-[16px] border bg-background p-0 !pb-0 shadow-sm ${props.className}`}
          >
            {/* Text box */}
            <div className='flex h-full w-full flex-col justify-between p-[30px] pr-0'>
              <div className='text-xl font-semibold'>{props.title}</div>
              <div className='text-base font-normal text-secondary'>
                {props.description}
              </div>
            </div>
            <div className='min-w-[400px]'>
              <Image
                src={props.img}
                draggable={false}
                alt='Image'
                width={400}
                height={1000}
              />
            </div>
          </div>
        );
      case 'horizontal-right':
        return (
          <div
            className={`grid w-full grid-cols-[1fr,4fr] overflow-hidden rounded-[16px] border bg-background p-0 !pb-0 shadow-sm ${props.className}`}
          >
            <div className='min-w-[400px]'>
              <Image
                src={props.img}
                alt='Image'
                draggable={false}
                width={400}
                height={1000}
              />
            </div>
            {/* Text box */}
            <div className='flex h-full w-full flex-col justify-between p-[30px] pl-0'>
              <div className='text-xl font-semibold'>{props.title}</div>
              <div className='text-base font-normal text-secondary'>
                {props.description}
              </div>
            </div>
          </div>
        );
      case 'vertical':
        return (
          <div
            className={`grid w-full overflow-hidden rounded-[16px] border bg-background p-0 !pb-0 shadow-sm ${props.className}`}
          >
            {/* Text box */}
            <div className='flex h-fit w-full flex-col justify-between gap-8 p-[30px]'>
              <div className='text-xl font-semibold'>{props.title}</div>
              <div className='text-base font-normal text-secondary'>
                {props.description}
              </div>
            </div>
            <div className='min-w-none mx-auto flex h-fit max-h-[500px] max-w-[450px] items-center justify-center'>
              <Image
                src={props.img}
                alt='Image'
                className='max-h-[500px]'
                draggable={false}
                height={340}
                width={1000}
              />
            </div>
          </div>
        );
    }
  };
  return render();
}
