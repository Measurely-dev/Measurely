import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Container from '@/components/website/container';
import Content from '@/components/website/content';
import FooterHeader from '@/components/website/footer-header';
import { Author, BlogMdxFrontmatter, getAllBlogs } from '@/lib/markdown';
import { formatDate2, stringToDate } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// Define metadata for SEO and page headers
export const metadata: Metadata = {
  title: 'Blog',
};

// Main page component for the blog index
export default async function BlogIndexPage() {
  // Fetch all blogs and sort them by date in descending order
  const blogs = (await getAllBlogs()).sort(
    (a, b) => stringToDate(b.date).getTime() - stringToDate(a.date).getTime(),
  );

  return (
    <Container className='w-full'>
      <Content type='page' className='mx-auto w-[95%]'>
        {/* Blog header with gradient text */}
        <div className='mb-20 w-full text-6xl'>
          <span className='mr-3 animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
            Blog
          </span>
        </div>

        {/* Grid layout for blog cards */}
        <div className='mb-5 grid grid-cols-2 gap-10 max-md:grid-cols-1'>
          {blogs.map((blog) => (
            <BlogCard {...blog} slug={blog.slug} key={blog.slug} />
          ))}
        </div>

        {/* Footer header for waitlist */}
        <FooterHeader type='waitlist' className='mt-[170px]' />
      </Content>
    </Container>
  );
}

// BlogCard component to display individual blog posts
function BlogCard({
  date,
  title,
  slug,
  cover,
  authors,
}: BlogMdxFrontmatter & { slug: string }) {
  // Format the date and check if the blog is new (published within the last 7 days)
  const formattedDate = date.split('-').reverse().join('-');
  const newDate = parseISO(formattedDate);
  const isValidDate = !isNaN(newDate.getTime());
  const isNew = isValidDate && differenceInDays(new Date(), newDate) < 7;

  return (
    <Link
      href={`/blog/${slug}`}
      className='group relative flex select-none flex-col items-start gap-2'
    >
      {/* Blog cover image */}
      <div className='relative w-full'>
        <Image
          src={cover}
          alt={title}
          width={500}
          height={800}
          quality={80}
          className='mb-3 h-fit w-full rounded-xl border object-cover'
        />
        {/* Display "New" badge if the blog is recently published */}
        {isNew && (
          <div className='absolute bottom-0 left-0 h-fit w-fit animate-gradient rounded-[8px] bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 p-0.5 px-2 text-xs font-medium text-white'>
            New
          </div>
        )}
      </div>

      {/* Blog title and metadata */}
      <div className='pt-none w-full'>
        <div className='mb-3 flex flex-row items-center gap-3 text-2xl font-semibold'>
          {title}
        </div>
        <div className='mt-auto flex w-full items-center gap-2'>
          {/* Display author avatars */}
          <AvatarGroup users={authors} />

          {/* Display publication date */}
          <div className='text-[13px] text-muted-foreground'>
            Published on {formatDate2(date)}
          </div>
        </div>
      </div>
    </Link>
  );
}

// AvatarGroup component to display a group of avatars
function AvatarGroup({ users, max = 4 }: { users: Author[]; max?: number }) {
  // Slice the users array to display only the first `max` users
  const displayUsers = users.slice(0, max);
  const remainingUsers = Math.max(users.length - max, 0);

  return (
    <div className='items-centert flex'>
      {/* Map through the display users and render their avatars */}
      {displayUsers.map((user, index) => (
        <Avatar
          key={user.username}
          className={`inline-block size-7 border border-input ${
            index !== 0 ? '-ml-3' : ''
          } `}
        >
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {/* Display a fallback avatar if there are remaining users */}
      {remainingUsers > 0 && (
        <Avatar className='-ml-3 inline-block border border-input transition-transform hover:translate-y-1'>
          <AvatarFallback>+{remainingUsers}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
