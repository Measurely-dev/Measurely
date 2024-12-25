import { BaseMdxFrontmatter, getAllChilds } from '@/lib/markdown';
import Link from 'next/link';

export default async function Outlet({ path }: { path: string }) {
  if (!path) throw new Error('path not provided');
  const output = await getAllChilds(path);

  return (
    <div className='grid gap-5 md:grid-cols-2'>
      {output.map((child: any) => (
        <ChildCard {...child} key={child.title} />
      ))}
    </div>
  );
}

type ChildCardProps = BaseMdxFrontmatter & { href: string };

function ChildCard({ description, href, title }: ChildCardProps) {
  return (
    <Link
      href={href}
      className='flex flex-col gap-0.5 rounded-md border p-4 no-underline'
    >
      <h4 className='!my-0'>{title}</h4>
      <p className='!my-0 text-sm text-muted-foreground'>{description}</p>
    </Link>
  );
}
