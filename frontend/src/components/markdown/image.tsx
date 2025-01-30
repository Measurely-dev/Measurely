import { ComponentProps } from 'react';
import NextImage from 'next/image';

// Define Height and Width types using Next.js Image component props
type Height = ComponentProps<typeof NextImage>['height'];
type Width = ComponentProps<typeof NextImage>['width'];

/**
 * Wrapper component for Next.js Image that provides default styling and props
 * @param src - Source URL of the image
 * @param alt - Alt text for the image, defaults to 'alt'
 * @param width - Width of the image in pixels, defaults to 800
 * @param height - Height of the image in pixels, defaults to 350
 * @param props - Additional HTML img props passed through
 */
export default function Image({
  src,
  alt = 'alt',
  width = 800,
  height = 350,
  ...props
}: ComponentProps<'img'>) {
  // Return null if no src provided
  if (!src) return null;

  // Render Next.js Image with default styling and passed props
  return (
    <NextImage
      src={src}
      alt={alt}
      width={width as Width}
      height={height as Height}
      quality={60}
      className='aspect-video object-cover w-full max-w-[1000px] rounded-[12px] border'
      {...props}
    />
  );
}
