import { ROUTES } from '@/lib/routes-config';
import SubLink from './sublink';

export default function DocsMenu({ isSheet = false }) {
  return (
    <div className='mt-5 flex flex-col gap-3.5 pb-6 pr-2'>
      {ROUTES.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `/docs${item.href}`,
          level: 0,
          isSheet,
        };
        return <SubLink key={item.title + index} {...modifiedItems} />;
      })}
    </div>
  );
}
