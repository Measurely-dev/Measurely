import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import WebPageHeader from '@/components/website/page-header';
import { Author, BlogMdxFrontmatter, getAllBlogs } from '@/lib/markdown';
import { formatDate2, stringToDate } from '@/lib/utils';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { parseISO, differenceInDays } from 'date-fns';
import WebFooterHeader from '@/components/website/footer-header';
import WebTitle from '@/components/website/title';
import { Accordion, Content, Tab, Trigger } from '@/components/ui/accordion';
import { FAQQuestions } from '@/components/global/faq-questions';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function BlogIndexPage() {
  const blogs = (await getAllBlogs()).sort(
    (a, b) => stringToDate(b.date).getTime() - stringToDate(a.date).getTime(),
  );
  return (
    <WebContainer className='w-full'>
      <ContentContainer type='page' className='mx-auto w-[95%]'>
        <div className='mb-20 w-full text-6xl'>
          <span className='mr-3 animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text font-mono text-transparent'>
            Blog
          </span>
        </div>
        <div className='mb-5 grid grid-cols-2 gap-10 max-md:grid-cols-1'>
          {blogs.map((blog) => (
            <BlogCard {...blog} slug={blog.slug} key={blog.slug} />
          ))}
        </div>
        <WebFooterHeader className='mt-[170px]' />
      </ContentContainer>
    </WebContainer>
  );
}

function BlogCard({
  date,
  title,
  description,
  slug,
  cover,
  authors,
}: BlogMdxFrontmatter & { slug: string }) {
  const formattedDate = date.split('-').reverse().join('-');
  const newDate = parseISO(formattedDate);
  const isValidDate = !isNaN(newDate.getTime());
  const isNew = isValidDate && differenceInDays(new Date(), newDate) < 7;
  return (
    <Link
      href={`/blog/${slug}`}
      className='group relative flex select-none flex-col items-start gap-2'
    >
      <div className='relative w-full'>
        <Image
          src={cover}
          alt={title}
          width={500}
          height={800}
          quality={80}
          className='mb-3 h-fit w-full rounded-xl border object-cover'
        />
        {isNew && (
          <div className='absolute bottom-0 left-0 h-fit w-fit animate-gradient rounded-[8px] bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 p-0.5 px-2 text-xs font-medium text-white'>
            New
          </div>
        )}
      </div>
      <div className='pt-none w-full'>
        <div className='mb-3 flex flex-row items-center gap-3 text-2xl font-semibold'>
          {title}
        </div>
        <div className='mt-auto flex w-full items-center gap-2'>
          <AvatarGroup users={authors} />

          <div className='text-[13px] text-muted-foreground'>
            Published on {formatDate2(date)}
          </div>
        </div>
      </div>
    </Link>
  );
}

function AvatarGroup({ users, max = 4 }: { users: Author[]; max?: number }) {
  const displayUsers = users.slice(0, max);
  const remainingUsers = Math.max(users.length - max, 0);

  return (
    <div className='items-centert flex'>
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
      {remainingUsers > 0 && (
        <Avatar className='-ml-3 inline-block border border-input transition-transform hover:translate-y-1'>
          <AvatarFallback>+{remainingUsers}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
