import Footer from '@/components/website/footer';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      <div className="min-h-screen w-screen">{children}</div>
      <Footer bg="secondary" border={false} />
    </div>
  );
}

