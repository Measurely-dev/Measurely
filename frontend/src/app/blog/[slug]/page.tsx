import { Typography } from '@/components/markdown/typography';
import { Button } from '@/components/ui/button';
import { Author, getAllBlogStaticPaths, getBlogForSlug } from '@/lib/markdown';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: PageProps) {
  const params = await props.params;

  const { slug } = params;

  const res = await getBlogForSlug(slug);
  if (!res) return null;
  const { frontmatter } = res;
  return {
    title: frontmatter.title,
    description: frontmatter.description,
  };
}

export async function generateStaticParams() {
  const val = await getAllBlogStaticPaths();
  if (!val) return [];
  return val.map((it: any) => ({ slug: it }));
}

export default async function BlogPage(props: PageProps) {
  const params = await props.params;

  const { slug } = params;

  const res = await getBlogForSlug(slug);
  if (!res) notFound();
  console.log(<Typography>{res?.content}</Typography>)
  return (
    <WebContainer>
      <ContentContainer
        type='page'
        className='sm:[95%] md:[75%] mx-auto items-start lg:w-[60%]'
      >
        <Link href='/blog' className='mb-5'>
          <Button
            variant={'secondary'}
            className='group relative overflow-hidden rounded-[12px] transition-all duration-200'
          >
            <ArrowLeftIcon className='absolute -left-5 size-4 transition-all duration-200 group-hover:left-3' />
            <div className='transition-all duration-200 group-hover:ml-5'>
              Back to blog
            </div>
          </Button>
        </Link>
        <div className='mb-2 flex w-full flex-col gap-3 pb-7'>
          <p className='text-sm text-muted-foreground'>
            {formatDate(res.frontmatter.date)}
          </p>
          <h1 className='font-mono text-3xl font-extrabold sm:text-4xl'>
            {res.frontmatter.title}
          </h1>
          <div className='mt-6 flex flex-col gap-3'>
            <p className='text-sm text-muted-foreground'>Posted by</p>
            <Authors authors={res.frontmatter.authors} />
          </div>
        </div>
        <div className='!w-full'>
          <div className='mb-7 w-full'>
            <Image
              src={res.frontmatter.cover}
              alt='cover'
              width={700}
              height={400}
              className='h-[400px] w-full rounded-2xl border object-cover'
            />
          </div>
          <Typography>{res.content}</Typography>
        </div>
      </ContentContainer>
    </WebContainer>
  );
}

function Authors({ authors }: { authors: Author[] }) {
  return (
    <div className='flex flex-wrap items-center gap-8'>
      {authors.map((author) => {
        return (
          <Link
            href={author.handleUrl}
            className='flex items-center gap-2'
            key={author.username}
          >
            <Avatar className='h-10 w-10'>
              <AvatarImage src={author.avatar} />
              <AvatarFallback>
                {author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium'>{author.username}</p>
              <p className='font-code text-[13px] text-muted-foreground'>
                @{author.handle}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
