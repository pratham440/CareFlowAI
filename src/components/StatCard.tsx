import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'default' | 'urgent' | 'teal' | 'sky';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  let themeStyles = {
    card: 'border-slate-200/80 bg-white hover:border-slate-300',
    iconBg: 'bg-slate-100 text-slate-700',
    number: 'text-slate-900',
  };

  if (variant === 'urgent') {
    themeStyles = {
      card: 'border-rose-300/80 bg-rose-50/30 hover:border-rose-400',
      iconBg: 'bg-rose-100 text-rose-700',
      number: 'text-rose-700',
    };
  } else if (variant === 'sky') {
    themeStyles = {
      card: 'border-sky-200/80 bg-sky-50/20 hover:border-sky-300',
      iconBg: 'bg-sky-100 text-sky-800',
      number: 'text-slate-900',
    };
  } else if (variant === 'teal') {
    themeStyles = {
      card: 'border-teal-200/80 bg-teal-50/20 hover:border-teal-300',
      iconBg: 'bg-teal-100 text-teal-800',
      number: 'text-slate-900',
    };
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative p-5 rounded-xl border shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      } ${themeStyles.card}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className={`p-2 rounded-lg ${themeStyles.iconBg}`}>
          <Icon className="w-5 h-5 stroke-[1.8]" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-3xl font-bold tracking-tight tabular-nums ${themeStyles.number}`}>
          {value}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
};
