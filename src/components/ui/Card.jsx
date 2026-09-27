import { cn } from '@/utils/cn';

export function Card({ as: Component = 'div', className, children, ...props }) {
  return (
    <Component className={cn('rounded-md border border-line bg-surface', className)} {...props}>
      {children}
    </Component>
  );
}
