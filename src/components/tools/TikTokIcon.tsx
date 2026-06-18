import { SVGProps } from 'react';

/** Official TikTok glyph as a currentColor SVG so it matches Lucide icon usage. */
const TikTokIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9V9c-1.2 0-2.4-.4-3.5-1.1v6.6c0 3.4-2.7 6-6 6S4 17.9 4 14.5 6.7 8.5 10 8.5c.3 0 .6 0 .9.1v2.4a3.6 3.6 0 0 0-.9-.1c-1.9 0-3.5 1.6-3.5 3.6S8.1 18 10 18s3.5-1.5 3.5-3.5V3h3z" />
  </svg>
);

export default TikTokIcon;
