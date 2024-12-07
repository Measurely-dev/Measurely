export default function ShowcaseCursor(props: {
  cursor: 1 | 2 | 3;
  className: string;
}) {
  return props.cursor === 1
    ? cursor1(props.className)
    : props.cursor === 2
      ? cursor2(props.className)
      : cursor3(props.className);
}

function cursor1(className: string) {
  return (
    <div className={`relative ${className}`}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='#000000'
        version='1.1'
        id='Capa_1'
        width='20px'
        height='24px'
        className='absolute bottom-[-18px] left-[-18px] rotate-[180deg]'
        viewBox='0 0 266.495 266.494'
      >
        <g>
          <g>
            <path d='M150.036,266.494c-0.264,0-0.517-0.006-0.792-0.018c-6.102-0.337-11.332-4.474-13.046-10.347l-26.067-89.027    l-95.203-18.867c-6.014-1.194-10.614-6.059-11.476-12.123c-0.858-6.062,2.201-12.016,7.65-14.832L242.143,1.617    C247.5-1.175,254.057-0.29,258.518,3.8c4.474,4.101,5.885,10.55,3.562,16.146l-98.743,237.655    C161.097,263.018,155.836,266.494,150.036,266.494z' />
          </g>
        </g>
      </svg>
      <div className='w-fit rounded-[100px_100px_100px_20px] border-[1.5px] bg-background p-1 px-2 text-sm'>
        Marcus
      </div>
    </div>
  );
}
function cursor2(className: string) {
  return (
    <div className={`relative ${className}`}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='#000000'
        version='1.1'
        id='Capa_1'
        width='20px'
        height='24px'
        className='absolute left-[-18px] top-[-18px] rotate-[260deg]'
        viewBox='0 0 266.495 266.494'
      >
        <g>
          <g>
            <path d='M150.036,266.494c-0.264,0-0.517-0.006-0.792-0.018c-6.102-0.337-11.332-4.474-13.046-10.347l-26.067-89.027    l-95.203-18.867c-6.014-1.194-10.614-6.059-11.476-12.123c-0.858-6.062,2.201-12.016,7.65-14.832L242.143,1.617    C247.5-1.175,254.057-0.29,258.518,3.8c4.474,4.101,5.885,10.55,3.562,16.146l-98.743,237.655    C161.097,263.018,155.836,266.494,150.036,266.494z' />
          </g>
        </g>
      </svg>
      <div className='w-fit rounded-[20px_100px_100px_100px] border-[1.5px] border-black bg-[#343A40] p-1 px-2 text-sm text-white'>
        Francis
      </div>
    </div>
  );
}

function cursor3(className: string) {
  return (
    <div className={`relative ${className}`}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='#000000'
        version='1.1'
        id='Capa_1'
        width='20px'
        height='24px'
        className='absolute bottom-[-18px] right-[-18px] rotate-[90deg]'
        viewBox='0 0 266.495 266.494'
      >
        <g>
          <g>
            <path d='M150.036,266.494c-0.264,0-0.517-0.006-0.792-0.018c-6.102-0.337-11.332-4.474-13.046-10.347l-26.067-89.027    l-95.203-18.867c-6.014-1.194-10.614-6.059-11.476-12.123c-0.858-6.062,2.201-12.016,7.65-14.832L242.143,1.617    C247.5-1.175,254.057-0.29,258.518,3.8c4.474,4.101,5.885,10.55,3.562,16.146l-98.743,237.655    C161.097,263.018,155.836,266.494,150.036,266.494z' />
          </g>
        </g>
      </svg>
      <div className='w-fit animate-gradient rounded-[100px_100px_100px_20px] border-[1.5px] bg-background bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text p-1 px-2 text-sm text-transparent'>
        Click here
      </div>
    </div>
  );
}
