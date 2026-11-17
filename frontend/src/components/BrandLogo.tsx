type BrandLogoProps = {
  className?: string;
  /** compact = navbar height; hero = auth/about */
  size?: 'compact' | 'hero' | 'card';
};

const sizeClass: Record<NonNullable<BrandLogoProps['size']>, string> = {
  compact: 'h-8 w-auto',
  hero: 'h-16 md:h-20 w-auto max-w-full',
  card: 'h-14 w-auto',
};

export default function BrandLogo({ className = '', size = 'compact' }: BrandLogoProps) {
  return (
    <img
      src="/ecuview-logo.png"
      alt="ECUView — MDF / DAT Analysis Platform"
      className={`${sizeClass[size]} object-contain ${className}`.trim()}
      decoding="async"
    />
  );
}
