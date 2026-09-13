import React from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'slate' | 'rose';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subValue,
  icon,
  color = 'cyan',
}) => {
  const colorStyles = {
    cyan: 'border-cyan-500/20 text-cyan-400 bg-cyan-950/10',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/10',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-950/10',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-950/10',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-950/10',
    slate: 'border-slate-800 text-slate-300 bg-slate-900/40',
  }[color];

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 hover:border-slate-700 ${colorStyles}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && <div className="p-1.5 rounded-lg bg-slate-900/60">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-slate-100">{value}</span>
        {subValue && (
          <span className="text-xs font-mono text-slate-400">{subValue}</span>
        )}
      </div>
    </div>
  );
};
