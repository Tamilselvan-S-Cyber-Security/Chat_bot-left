import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({
  variant = 'light',
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        variant === 'light'
          ? 'glass rounded-2xl p-6 shadow-sm'
          : 'glass-dark rounded-2xl p-6 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
