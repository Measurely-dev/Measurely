// HeroTitle Component: Renders a title section with a subtitle and main title
export default function HeroTitle(props: {
  className?: string;
  subtitle: string;
  title: string;
  titleClassName?: string;
}) {
  return (
    // Container with flex column layout and center alignment
    <div className={`flex flex-col gap-[10px] text-center ${props.className}`}>
      {/* Subtitle with decorative symbol prefix */}
      <div className="text-center text-lg font-medium">✧ {props.subtitle}</div>

      {/* Main title with responsive font sizes */}
      <div
        className={`text-center text-[40px] font-medium max-md:text-[32px] max-sm:text-[24px] ${props.titleClassName}`}
      >
        {props.title}
      </div>
    </div>
  );
}
