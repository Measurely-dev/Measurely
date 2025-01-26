// Import route configuration and sublink component
import { ROUTES } from '@/lib/routes-config';
import SubLink from './sublink';

// DocsMenu component renders the documentation navigation menu
// isSheet parameter determines if this is displayed in sheet mode
export default function DocsMenu({ isSheet = false }) {
  return (
    // Container for menu items with vertical flex layout and spacing
    <div className='mt-5 flex flex-col gap-3.5 pb-6 pr-2'>
      {/* Map through routes array to create menu items */}
      {ROUTES.map((item, index) => {
        // Create modified item object with docs prefix in href and additional props
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
