import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'default' | 'icon';
};

export function Button({
  className,
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        size === 'icon' ? 'w-10 p-0' : 'px-4',
        variant === 'primary' &&
          'border-primary bg-primary text-black hover:border-white hover:bg-white',
        variant === 'secondary' &&
          'border-border bg-secondary text-secondary-foreground hover:bg-muted',
        variant === 'destructive' &&
          'border-destructive bg-transparent text-destructive hover:bg-destructive/10',
        className,
      )}
      {...props}
    />
  );
}
