import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './dropdown-menu';

export const colors: Record<
  | 'pink'
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'cyan'
  | 'indigo'
  | 'magenta',
  string
> = {
  pink: '#ff007f',
  blue: '#0033cc',
  purple: '#8000ff',
  green: '#007f3f',
  orange: '#ff6600',
  red: '#cc0000',
  yellow: '#cc9900',
  cyan: '#00cccc',
  indigo: '#3a2fbf',
  magenta: '#cc00cc',
} as const;

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
        <DropdownMenuSubContent className='max-h-[300px]overflow-y-auto'>
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
