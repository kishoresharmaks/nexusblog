import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (Classnames merging utility)', () => {
  it('should merge class strings correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('should handle conditionals and undefined values', () => {
    const isPrimary = true;
    const isHidden = false;
    expect(cn('btn', isPrimary && 'btn-primary', isHidden && 'hidden', undefined, null)).toBe(
      'btn btn-primary',
    );
  });

  it('should deduplicate and resolve conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
