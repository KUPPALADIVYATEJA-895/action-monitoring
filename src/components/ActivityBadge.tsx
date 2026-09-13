import React from 'react';
import { ActivityType, MovementState } from '../types';
import {
  User,
  Armchair,
  Footprints,
  Zap,
  Phone,
  Package,
  Users,
  HelpCircle,
} from 'lucide-react';

interface ActivityBadgeProps {
  activity: ActivityType;
  movement?: MovementState;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ActivityBadge: React.FC<ActivityBadgeProps> = ({
  activity,
  movement,
  showIcon = true,
  size = 'md',
}) => {
  const getActivityConfig = () => {
    switch (activity) {
      case 'Standing':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: <User className="w-3.5 h-3.5" />,
        };
      case 'Sitting':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: <Armchair className="w-3.5 h-3.5" />,
        };
      case 'Walking':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <Footprints className="w-3.5 h-3.5" />,
        };
      case 'Running':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <Zap className="w-3.5 h-3.5" />,
        };
      case 'Using Phone':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: <Phone className="w-3.5 h-3.5" />,
        };
      case 'Holding Object':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: <Package className="w-3.5 h-3.5" />,
        };
      case 'Interacting With Person':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: <Users className="w-3.5 h-3.5" />,
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          icon: <HelpCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  const config = getActivityConfig();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center font-medium rounded-md border ${config.bg} ${sizeClasses}`}
      >
        {showIcon && config.icon}
        <span>{activity}</span>
      </span>

      {movement && (
        <span
          className={`inline-flex items-center text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${
            movement === 'MOVING'
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
              : 'bg-slate-900/60 text-slate-400 border-slate-800'
          }`}
        >
          {movement}
        </span>
      )}
    </div>
  );
};
