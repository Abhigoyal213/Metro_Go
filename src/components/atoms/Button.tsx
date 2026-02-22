import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  as?: string;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled = false,
  as,
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-bold rounded-xl transition-all flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20',
    secondary: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-4 text-base',
  };
  
  const disabledStyles = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';
  
  const Component = as || 'button';
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
