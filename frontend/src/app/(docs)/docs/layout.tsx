import { Leftbar } from '@/components/docs/leftbar';

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex items-start'>
      <Leftbar key='leftbar' />
      <div className='flex-[5.25] w-full'>{children}</div>
    </div>
  );
}
