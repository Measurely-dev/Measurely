import Link from 'next/link';

export default function Links(props: { links: Array<any> }) {
  return (
    <div className='flex items-center gap-4'>
      {props.links?.map((link, i) => {
        return (
          <Link
            key={i}
            href={link.href}
            className='text-xs font-medium transition-all duration-200 hover:opacity-70'
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}
