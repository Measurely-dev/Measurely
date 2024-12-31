// External and components
import Link from 'next/link';

export default function FooterLink(props: {
  name: string[] | string;
  href: string;
  key: any;
}) {
  return (
    <Link
      href={props.href}
      key={props.key}
      className='w-auto max-w-fit text-sm text-[#666666] hover:text-primary max-md:mb-1 max-md:max-w-full'
    >
      {props.name}
    </Link>
  );
}
