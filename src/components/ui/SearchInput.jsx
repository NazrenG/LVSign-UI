import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { inputStyles } from './Input';

export function SearchInput({ className, placeholder = 'Search', ...props }) {
  return (
    <label className={cn('relative block', className)}>
      <span className="sr-only">{placeholder}</span>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
      <input type="search" placeholder={placeholder} className={cn(inputStyles, 'pl-10')} {...props} />
    </label>
  );
}
