import path from 'path';
import fs from 'fs';
import remarkGfm from 'remark-gfm';
import { compileMDX } from 'next-mdx-remote/rsc'; // Corrected import
import rehypePrism from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeCodeTitles from 'rehype-code-titles';
import { page_routes } from './routes-config';

import Note from '@/components/docs/note';
import { Stepper, StepperItem } from '@/components/docs/stepper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const components = {
  Note,
  Stepper,
  StepperItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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

// logic for docs

type BaseMdxFrontmatter = {
  title: string;
  description: string;
};

export async function getDocsForSlug(slug: string) {
  try {
    const contentPath = getDocsContentPath(slug);
    const rawMdx = fs.readFileSync(contentPath, 'utf-8');
    return await parseMdx<BaseMdxFrontmatter>(rawMdx);
  } catch (err) {
    console.log(err);
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
  // captures between ## - #### can modify accordingly
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
  return path.join(
    process.cwd(),
    '/src/docs-contents/docs/',
    `${slug}/index.mdx`,
  );
}
