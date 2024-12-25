import path from 'path';
import fs from 'fs';
import remarkGfm from 'remark-gfm';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypePrism from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeCodeTitles from 'rehype-code-titles';
import { page_routes, ROUTES } from './routes-config';
import matter from 'gray-matter';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Pre from '@/components/markdown/Pre';
import Note from '@/components/markdown/note';
import { Stepper, StepperItem } from '@/components/markdown/stepper';
import Image from '@/components/markdown/image';
import Link from '@/components/markdown/link';
import Outlet from '@/components/markdown/outlet';

const components = {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  pre: Pre,
  Note,
  Stepper,
  StepperItem,
  img: Image,
  a: Link,
  Outlet,
};

async function parseMdx<Frontmatter>(rawMdx: string) {
  return await compileMDX<Frontmatter>({
    source: rawMdx,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          rehypeCodeTitles,
          rehypePrism,
          rehypeSlug,
          rehypeAutolinkHeadings,
        ],
        remarkPlugins: [remarkGfm],
      },
    },
    components,
  });
}

export type BaseMdxFrontmatter = {
  title: string;
  description: string;
};

export async function getDocsForSlug(slug: string) {
  try {
    const contentPath = getDocsContentPath(slug);
    const rawMdx = fs.readFileSync(contentPath, 'utf-8');
    return await parseMdx<BaseMdxFrontmatter>(rawMdx);
  } catch (err) {
    console.error('Error getting docs for slug:', err);
    return null;
  }
}

export function getPreviousNext(path: string) {
  const index = page_routes.findIndex(({ href }) => href == `/${path}`);
  return {
    prev: page_routes[index - 1],
    next: page_routes[index + 1],
  };
}

export function getDocsTocs(
  slug: string,
): { level: number; text: string; href: string }[] {
  const contentPath = getDocsContentPath(slug);
  const rawMdx = fs.readFileSync(contentPath, 'utf-8');
  const headingsRegex = /^(#{2,4})\s(.+)$/gm;
  let match;
  const extractedHeadings: { level: number; text: string; href: string }[] = [];
  while ((match = headingsRegex.exec(rawMdx)) !== null) {
    const headingLevel = match[1].length;
    const headingText = match[2].trim();
    const slug = sluggify(headingText);
    extractedHeadings.push({
      level: headingLevel,
      text: headingText,
      href: `#${slug}`,
    });
  }
  return extractedHeadings;
}

function sluggify(text: string) {
  const slug = text.toLowerCase().replace(/\s+/g, '-');
  return slug.replace(/[^a-z0-9-]/g, '');
}

function getDocsContentPath(slug: string) {
  return path.join(process.cwd(), '/src/contents/docs/', `${slug}/index.mdx`);
}

export type Author = {
  avatar?: string;
  handle: string;
  username: string;
  handleUrl: string;
};

export type BlogMdxFrontmatter = BaseMdxFrontmatter & {
  date: string;
  authors: Author[];
  cover: string;
};

export async function getAllBlogs() {
  const blogFolder = path.join(process.cwd(), '/src/contents/blogs/');
  const files = fs.readdirSync(blogFolder);
  const uncheckedRes = await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith('.mdx')) return undefined;
      const filepath = path.join(process.cwd(), `/src/contents/blogs/${file}`);
      const rawMdx = fs.readFileSync(filepath, 'utf-8');
      return {
        ...justGetFrontmatterFromMD<BlogMdxFrontmatter>(rawMdx),
        slug: file.split('.')[0],
      };
    }),
  );
  return uncheckedRes.filter((it) => !!it) as (BlogMdxFrontmatter & {
    slug: string;
  })[];
}

export async function getBlogForSlug(slug: string) {
  const blogFile = path.join(
    process.cwd(),
    '/src/contents/blogs/',
    `${slug}.mdx`,
  );
  try {
    const rawMdx = fs.readFileSync(blogFile, 'utf-8');
    return await parseMdx<BlogMdxFrontmatter>(rawMdx);
  } catch {
    return undefined;
  }
}

export async function getAllBlogStaticPaths() {
  try {
    const blogFolder = path.join(process.cwd(), '/src/contents/blogs/');
    const res = fs.readdirSync(blogFolder);
    return res.map((file) => file.split('.')[0]);
  } catch (err) {
    console.log(err);
  }
}

function justGetFrontmatterFromMD<Frontmatter>(rawMd: string): Frontmatter {
  try {
    const matterResult = matter(rawMd);
    return matterResult.data as Frontmatter;
  } catch (err) {
    console.error('Error parsing frontmatter:', err);
    return {} as Frontmatter;
  }
}

export async function getAllChilds(pathString: string) {
  const items = pathString.split('/').filter((it) => it !== '');

  let page_routes_copy = ROUTES;
  let prevHref = '';

  for (const it of items) {
    const found = page_routes_copy.find((innerIt) => innerIt.href === `/${it}`);

    if (!found) {
      return [];
    }

    prevHref += found.href;
    page_routes_copy = found.items ?? [];
  }

  if (!prevHref) {
    return [];
  }

  return await Promise.all(
    page_routes_copy.map(async (it) => {
      const totalPath = path.join(
        process.cwd(),
        '/contents/docs/',
        prevHref,
        it.href,
        'index.mdx',
      );

      try {
        const rawMdx = fs.readFileSync(totalPath, 'utf-8');
        return {
          ...justGetFrontmatterFromMD<BaseMdxFrontmatter>(rawMdx),
          href: `/docs${prevHref}${it.href}`,
        };
      } catch (err) {
        console.log(`Error reading MDX file: ${totalPath}`, err);
        return null;
      }
    }),
  ).then((result) => result.filter((item) => item !== null));
}
