import ShowcaseCursor from "@/components/website/components/showcase/cursor";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import Footer from "@/components/website/layout/footer/footer";
import Navbar from "@/components/website/layout/header/navbar";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-screen flex flex-col justify-center">
      <WebContainer>
        <ContentContainer className="min-h-screen">
          <div className="flex flex-col gap-5 my-auto mx-auto">
            <Link href="/home">
              <div className="text-5xl font-mono relative justify-center items-center font-bold hover:gap-5 duration-200 transition-all cursor-pointer hover:opacity-65 flex gap-2">
                404 Page Not Found <ArrowRight className="size-12" />
                <ShowcaseCursor cursor={3} className="!absolute -top-14 left-[-125px]" />
              </div>
            </Link>
          </div>
        </ContentContainer>
      </WebContainer>
      <Footer bg="default"  border={false} />
    </div>
  );
}
