import { Leftbar } from "@/components/docs/leftbar";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-start gap-14 max-lg:gap-0">
      <Leftbar key="leftbar" />
      <div className="flex-[4]">{children}</div>
    </div>
  );
}
