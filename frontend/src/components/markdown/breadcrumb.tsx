// Import required breadcrumb components for navigation
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react';

/**
 * Renders a breadcrumb navigation component for documentation pages
 * @param paths - Array of path segments to build the breadcrumb trail
 */
export default function DocsBreadcrumb({ paths }: { paths: string[] }) {
  return (
    <div className='pb-5'>
      <Breadcrumb>
        <BreadcrumbList>
          {/* Root "Docs" link */}
          <BreadcrumbItem>
            <BreadcrumbLink>Docs</BreadcrumbLink>
          </BreadcrumbItem>
          {/* Map through path segments to create breadcrumb items */}
          {paths.map((path, index) => (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {/* Render link for intermediate paths, page for current path */}
                {index < paths.length - 1 ? (
                  <BreadcrumbLink className='a'>
                    {toTitleCase(path)}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className='b'>
                    {toTitleCase(path)}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

/**
 * Converts a hyphen-separated string to title case
 * @param input - Hyphen-separated string
 * @returns String with first letter of each word capitalized
 */
function toTitleCase(input: string): string {
  const words = input.split('-');
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
  return capitalizedWords.join(' ');
}
