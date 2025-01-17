import Toc from '@/components/markdown/toc';
import { page_routes } from '@/lib/routes-config';
import { getDocsForSlug } from '@/lib/markdown';
import { Typography } from '@/components/markdown/typography';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Pagination from '@/components/markdown/pagination';
import DocsBreadcrumb from '@/components/markdown/breadcrumb';

type PageProps = {
  params: { slug: string[] };
};

export default async function DocsPage({ params: { slug = [] } }: PageProps) {
  const pathName = slug.join('/');
  const res = await getDocsForSlug(pathName);
  if (!res)
    return (
      <div className='flex h-[calc(100vh-70px)] w-full flex-col items-center justify-center gap-4'>
        <div className='font-mono text-4xl font-semibold'>Documentation</div>
        <div className='text-lg text-secondary'>Couldn't be found</div>
        <Link href={'/docs/getting-started/introduction'}>
          <Button className='text-md mt-3 h-[45px] rounded-[12px]' size={'lg'}>
            Back to docs
          </Button>
        </Link>
      </div>
    );
  return (
    <div className='flex items-start gap-5'>
      <div className='flex-[4.5] py-10 pt-9'>
        <DocsBreadcrumb paths={slug} />
        <Typography>
          <h1 className='-mt-2 text-3xl'>{res.frontmatter.title}</h1>
          <p className='-mt-4 text-[16.5px] text-[#78716c]'>
            {res.frontmatter.description}
          </p>
          <div>{res.content}</div>
          <Pagination pathname={pathName} />
        </Typography>
      </div>
      <Toc path={pathName} />
    </div>
  );
}

export async function generateMetadata({ params: { slug = [] } }: PageProps) {
  const pathName = slug.join('/');
  const res = await getDocsForSlug(pathName);
  if (!res) return {} as Metadata;
  const { frontmatter } = res;
  return {
    title: frontmatter.title + ' ' + '| Measurely',
    description: frontmatter.description,
  };
}

export function generateStaticParams() {
  return page_routes.map((item) => ({
    slug: item.href.split('/').slice(1),
  }));
}
