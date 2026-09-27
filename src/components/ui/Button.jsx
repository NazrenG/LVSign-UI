import { cn } from '@/utils/cn';

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover border border-primary',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-canvas',
  danger: 'bg-surface text-danger border border-line hover:bg-danger-soft',
  ghost: 'text-primary hover:bg-primary-soft border border-transparent',
  muted: 'bg-canvas-muted text-ink-muted border border-line hover:bg-line',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-[15px] gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

/**
 * Polymorphic button: <Button as={Link} to="/x" /> renders a router link
 * with exactly the same styles as a native <button>.
 */
export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  fullWidth = false,
  className,
  children,
  ...props
}) {
  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-[1.1em] shrink-0" strokeWidth={1.75} aria-hidden />}
      {children}
    </Component>
  );
}
