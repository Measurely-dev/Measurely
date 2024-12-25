import { Typography } from '@/components/markdown/typography';
import { Author, getAllBlogStaticPaths, getBlogForSlug } from '@/lib/markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: PageProps) {
  const params = await props.params;

  const { slug } = params;

  const res = await getBlogForSlug(slug);
  if (!res) return {title : ""};
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
  return (
    <WebContainer className='!w-[100vw] !max-w-[100vw]'>
      <ContentContainer type='page' className='!w-[100vw] !max-w-[100vw]'>
        <div className='sm:[95%] md:[75%] mx-auto flex flex-col items-center lg:w-[60%]'>
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
          <div className='flex w-full flex-col items-center justify-center gap-3 pb-14'>
            <div className='text-md mb-3 !text-muted-foreground'>
              {formatDate(res.frontmatter.date)}
            </div>
            <div className='animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text text-center text-5xl !font-medium text-transparent'>
              {res.frontmatter.title}
            </div>
            <div className='mt-5 flex flex-col gap-3'>
              <Authors authors={res.frontmatter.authors} />
            </div>
          </div>
        </div>

        <div className='w-full'>
          <Image
            src={res.frontmatter.cover}
            alt='cover'
            width={10000}
            height={10000}
            className='mx-auto mb-4 h-fit w-[90%] rounded-[12px] border max-w-[1050px]'
          />
        </div>
        <div className='sm:[95%] md:[75%] mx-auto flex max-w-[700px] flex-col items-center lg:w-[60%]'>
          <Typography>{res.content}</Typography>
        </div>
      </ContentContainer>
    </WebContainer>
  );
}

function Authors({ authors }: { authors: Author[] }) {
  return (
    <div className='flex flex-wrap items-center gap-4'>
      {authors.map((author) => {
        return (
          <Link
            href={author.handleUrl}
            className='flex items-center gap-2'
            key={author.username}
          >
            <Avatar className='size-7'>
              <AvatarImage src={author.avatar} />
              <AvatarFallback>
                {author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium text-secondary'>
                @{author.handle}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
