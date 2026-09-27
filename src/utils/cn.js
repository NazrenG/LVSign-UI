/** Joins class names, skipping falsy values: cn('a', isOn && 'b') */
export function cn(...classNames) {
  return classNames.filter(Boolean).join(' ');
}
