import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './dropdown-menu';

const colors: Record<
  | 'pink'
  | 'blue'
  | 'purple'
  | 'lightblue'
  | 'green'
  | 'teal'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'cyan'
  | 'indigo'
  | 'lime'
  | 'coral'
  | 'skyblue'
  | 'magenta'
  | 'lavender'
  | 'aquamarine'
  | 'gold'
  | 'salmon'
  | 'chartreuse',
  string
> = {
  pink: '#b03060',
  blue: '#1c3d7c',
  purple: '#4b0082',
  lightblue: '#34699a',
  green: '#2a6e4b',
  teal: '#005f60',
  orange: '#b65c22',
  red: '#8b0000',
  yellow: '#b8860b',
  cyan: '#006b6b',
  indigo: '#2a275f',
  lime: '#3b5f33',
  coral: '#a34233',
  skyblue: '#2d5c86',
  magenta: '#730073',
  lavender: '#574b90',
  aquamarine: '#2e8b57',
  gold: '#8b7500',
  salmon: '#803636',
  chartreuse: '#4b6b3c',
};

export default function ColorDropdown(props: {
  color: string;
  updateColor: (newcolor: string) => void;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <div className='flex w-full flex-row items-center justify-start gap-2 !p-0'>
          <div
            className='size-6 h-6 w-6 max-w-6 rounded-full border'
            style={{
              backgroundColor: `${props.color}66`,
              borderColor: `${props.color}33` || '#ccc',
            }}
          />
          Change color
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className='max-h-[300px] overflow-y-auto'>
          <DropdownMenuLabel>Select a color</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(colors).map(([key, value]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => props.updateColor(value)}
            >
              <div className='flex flex-row items-center gap-2'>
                <div
                  className='inline-block size-4 rounded-full'
                  style={{
                    backgroundColor: `${value}66`,
                    borderColor: `${value}33` || '#ccc',
                  }}
                />
                <div>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
