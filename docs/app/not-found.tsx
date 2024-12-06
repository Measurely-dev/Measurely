import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[99vh] text-center items-center justify-center px-2 py-6 flex flex-col gap-8">
      <div>
        <h2 className="text-5xl font-bold">404</h2>
        <p className="text-muted-foreground">We couldn't find this page :(</p>
      </div>

      <Link href="/docs/getting-started/introduction" className={buttonVariants({})}>
        Back to documentation
      </Link>
    </div>
  );
}
