import { BaseMdxFrontmatter, getAllChilds } from '@/lib/markdown';
import Link from 'next/link';

// Outlet component renders a grid of child pages from a given path
export default async function Outlet({ path }: { path: string }) {
  // Validate required path parameter
  if (!path) throw new Error('path not provided');

  // Fetch all child pages data from the provided path
  const output = await getAllChilds(path);

  // Render grid layout with responsive column count
  return (
    <div className='grid gap-5 md:grid-cols-2'>
      {output.map((child: any) => (
        <ChildCard {...child} key={child.title} />
      ))}
    </div>
  );
}

// Props interface for the ChildCard component
type ChildCardProps = BaseMdxFrontmatter & { href: string };

// ChildCard component displays a link card with title and description
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
