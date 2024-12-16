import { Leftbar } from '@/components/docs/leftbar';

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex items-start'>
      <Leftbar key='leftbar' />
      <div className='w-full flex-[5.25]'>{children}</div>
    </div>
  );
}
