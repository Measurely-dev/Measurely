// External and components
import Link from 'next/link';

export default function FooterLink(props: {
  name: string[] | string;
  href: string;
}) {
  return (
    <Link
      href={props.href}
      className='w-auto max-w-fit rounded-lg px-2 py-0.5 text-sm text-secondary transition-all duration-150 hover:bg-accent hover:text-primary max-md:mb-1 max-md:max-w-full'
    >
      {props.name}
    </Link>
  );
}
