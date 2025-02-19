/**
 * Header component that displays a title, optional description, and children elements
 * @param {Object} props - Component properties
 * @param {string} props.title - Main header title text
 * @param {string|null} [props.description] - Optional description text below title
 * @param {React.ReactNode} [props.children] - Child elements to render
 * @param {string} [props.className] - Additional CSS classes for container
 * @param {string} [props.titleClassName] - Additional CSS classes for title
 * @param {string} [props.descriptionClassName] - Additional CSS classes for description
 */
export default function Header(props: {
  title: string;
  description?: string | null;
  children?: any;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    // Main container with responsive flex layout
    <div
      className={`flex w-full gap-12 max-sm:flex-col max-sm:gap-5 sm:items-center sm:justify-between ${props.className}`}
    >
      {/* Title and description container */}
      <div className="flex flex-col gap-[5px]">
        {/* Title element */}
        <div className={`text-2xl font-medium ${props.titleClassName}`}>
          {props.title}
        </div>
        {/* Optional description element */}
        {props.description ? (
          <div
            className={`text-sm text-muted-foreground ${props.descriptionClassName}`}
          >
            {props.description}
          </div>
        ) : null}
      </div>
      {/* Render child elements */}
      {props.children}
    </div>
  );
}
