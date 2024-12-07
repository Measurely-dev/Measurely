import Toc from "@/components/docs/toc";
import { page_routes } from "@/lib/routes-config";
import { notFound } from "next/navigation";
import { getDocsForSlug } from "@/lib/markdown";
import { Typography } from "@/components/docs/typography";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PageProps = {
  params: { slug: string[] };
};

export default async function DocsPage({ params: { slug = [] } }: PageProps) {
  const pathName = slug.join("/");
  const res = await getDocsForSlug(pathName);
  if (!res) return <div className="w-full h-[calc(100vh-70px)] items-center justify-center flex flex-col gap-4">
    <div className="text-6xl font-mono font-semibold">Docs</div>
    <div className="text-secondary text-xl">Couldn't be found</div>
    <Link href={'/docs/getting-started/introduction'}>
      <Button className="rounded-[12px] mt-5 text-lg h-[45px]" size={"lg"}>Back to docs</Button>
    </Link>
  </div>;
  return (
    <div className="flex items-start gap-14">
      <div className="flex-[3] py-10">
        <Typography>
          <h1 className="text-3xl -mt-2">{res.frontmatter.title}</h1>
          <p className="-mt-4 text-muted-foreground text-[16.5px]">
            {res.frontmatter.description}
          </p>
          <div className="mt-5">{res.content}</div>
        </Typography>
      </div>
      <Toc path={pathName} />
    </div>
  );
}

export async function generateMetadata({ params: { slug = [] } }: PageProps) {
  const pathName = slug.join("/");
  const res = await getDocsForSlug(pathName);
  if (!res) return {} as Metadata;
  const { frontmatter } = res;
  return {
    title: frontmatter.title,
    description: frontmatter.description,
  };
}

export function generateStaticParams() {
  return page_routes.map((item) => ({
    slug: item.href.split("/").slice(1),
  }));
}
