import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label: string;
  valueText?: string;
  barClassName?: string;
  barStyle?: React.CSSProperties;
}

/**
 * Accessible progress bar component with ARIA attributes for screen readers.
 *
 * @param value - Current progress value (0 to max)
 * @param max - Maximum value (default: 100)
 * @param label - Accessible label for screen readers (e.g., "Hunger level")
 * @param valueText - Optional custom value text (e.g., "75% full"). If not provided, defaults to percentage.
 * @param barClassName - Additional classes for the progress bar fill
 * @param barStyle - Inline styles for the progress bar fill (e.g., background color)
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, label, valueText, className, barClassName, barStyle, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const defaultValueText = `${Math.round(percentage)}%`;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={valueText || defaultValueText}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-zinc-800', className)}
        {...props}
      >
        <div
          className={cn('h-full transition-all duration-300', barClassName)}
          style={{
            width: `${percentage}%`,
            ...barStyle,
          }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
export type { ProgressProps };
