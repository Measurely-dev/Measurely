// External and components
import Link from 'next/link';

export default function FooterLink(props: {
  name: string[] | string;
  href: string;
}) {
  return (
    <Link
      href={props.href}
      className='w-auto max-md:max-w-full max-md:mb-1 max-w-fit text-secondary rounded-lg px-2 py-0.5 text-sm transition-all duration-150 hover:bg-accent hover:text-primary'
    >
      {props.name}
    </Link>
  );
}
