import { ReactNode } from "react";

// PageHeader component displays a page title and optional description
export default function PageHeader(props: {
  className?: string;
  title: string | ReactNode;
  description?: string;
  descriptionClassName?: string;
}) {
  return (
    // Container div with flex column layout and center alignment
    <div
      className={`flex flex-col gap-[30px] text-center max-w-[900px] ${props.className}`}
    >
      {/* Title text with large font size */}
      <h1 className="!text-6xl text-center text font-medium max-md:!text-5xl max-sm:!text-4xl">
        {props.title}
      </h1>
      {/* Optional description text if provided */}
      {props.description && (
        <div
          className={`text-2xl mx-auto text-center text-muted-foreground max-md:text-xl max-sm:text-base ${props.descriptionClassName}`}
        >
          {props.description}
        </div>
      )}
    </div>
  );
}
