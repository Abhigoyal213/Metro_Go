import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
}

export default function Input({ label, icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-4 text-slate-400 material-symbols-outlined">
            {icon}
          </span>
        )}
        <input
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
