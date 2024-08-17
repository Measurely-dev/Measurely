import LogoSvg from '@/components/global/logoSvg';
import Link from 'next/link';
import Actions from './actions';
import Links from './links';

export default function Navbar(props: {
  type: 'default' | 'logged' | 'waitlist';
}) {
  const links: any = [
    {
      name: 'Documentations',
      href: '/Docs',
    },
    {
      name: 'Pricing',
      href: '/pricing',
    },
  ];
  return (
    <div className='fixed top-5 z-50 flex items-center gap-6 rounded-[20px] border border-background bg-accent/75 px-3 py-2 pl-4 backdrop-blur-xl'>
      {/* Logo */}
      <Link href='/'>
        <div className='size-8'>
          <LogoSvg />
        </div>
      </Link>
      {/* Links */}
      <Links links={links} />
      {/* Actions group */}
      <Actions type={props.type} />
    </div>
  );
}
