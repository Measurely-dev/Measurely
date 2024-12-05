import Link from "next/link";
import WebButton from "../../components/button";
import WebChip from "../../components/chip";
import Card1 from "../../components/showcase/card1";
import Card2 from "../../components/showcase/card2";
import Card3 from "../../components/showcase/card3";
import Card4 from "../../components/showcase/card4";
import Card5 from "../../components/showcase/card5";

export default function ShowcaseLandingSection(props: {
  type: "default" | "waitlist";
}) {
  return (
    <div className="relative flex h-screen min-h-[780px] max-md:pt-[23vh] w-screen flex-col items-center pt-[30vh]">
      <WebChip color="default" href="/">
        <span className="mr-1 font-medium">Measurably</span> is the new way
      </WebChip>
      <div className="mt-5 text-center text-6xl font-semibold max-sm:text-4xl leading-[1.15] tracking-normal max-md:text-5xl max-lg:text-5xl">
        <span className="font-mono bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 text-transparent bg-clip-text animate-gradient">Measurely</span> tracks what matters,
        <br className="max-md:hidden" /> grow with confidence.
      </div>
      <Link href="/register">
        <WebButton className="mt-8">
         Get started
        </WebButton>
      </Link>
      <Card5 className="absolute -left-16 -top-8 rotate-[9deg] max-lg:hidden" />
      <Card1 className="absolute -right-16 -top-8 rotate-[-9deg] max-lg:hidden" />
      <div className="absolute bottom-0 flex h-10 w-full max-w-[1200px] items-center justify-center">
        <Card2 className="absolute -bottom-10 right-16 rotate-[7deg] max-xl:w-[300px] max-lg:translate-x-[-45%] max-lg:rotate-0 max-md:hidden" />
        <Card3 className="absolute bottom-[90px] max-xl:w-[320px] max-lg:hidden" />
        <Card4 className="absolute -bottom-10 left-16 rotate-[-7deg] max-xl:w-[300px] max-lg:right-[50%] max-lg:translate-x-[50%] max-lg:rotate-0 max-md:left-[50%] max-md:w-[350px] max-md:translate-x-[-50%]" />
      </div>
    </div>
  );
}
