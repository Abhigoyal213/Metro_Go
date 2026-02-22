import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'warning' | 'success' | 'info' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'primary', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    warning: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    info: 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300',
  };
  
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };
  
  return (
    <span className={`font-bold rounded ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
