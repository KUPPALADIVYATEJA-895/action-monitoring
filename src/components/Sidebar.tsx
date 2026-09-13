import React from 'react';
import {
  LayoutDashboard,
  Video,
  Users,
  Activity,
  BarChart3,
  Lightbulb,
  FileSearch,
  Settings,
} from 'lucide-react';

export type NavSection =
  | 'dashboard'
  | 'monitor'
  | 'people'
  | 'activities'
  | 'analytics'
  | 'brainstorm'
  | 'analyst'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onNavigate }) => {
  const navItems = [
    {
      id: 'dashboard' as NavSection,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'monitor' as NavSection,
      label: 'Live Monitor',
      icon: <Video className="w-4 h-4" />,
      badge: 'LIVE',
    },
    {
      id: 'people' as NavSection,
      label: 'People Roster',
      icon: <Users className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'activities' as NavSection,
      label: 'Activities',
      icon: <Activity className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'analytics' as NavSection,
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'brainstorm' as NavSection,
      label: 'Brainstorm AI',
      icon: <Lightbulb className="w-4 h-4" />,
      badge: 'GEMINI',
    },
    {
      id: 'analyst' as NavSection,
      label: 'Analyst AI',
      icon: <FileSearch className="w-4 h-4" />,
      badge: 'GEMINI',
    },
    {
      id: 'settings' as NavSection,
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      badge: undefined,
    },
  ];

  return (
    <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="py-4">
        <div className="px-5 mb-3">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
            OPERATIONS CONSOLE
          </span>
        </div>
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      item.badge === 'LIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Telemetry Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40 text-[11px] font-mono text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>PIPELINE:</span>
          <span className="text-slate-300">MoveNet Lightning</span>
        </div>
        <div className="flex justify-between">
          <span>KEYPOINTS:</span>
          <span className="text-slate-300">17 COCO Standard</span>
        </div>
        <div className="flex justify-between">
          <span>SECURITY:</span>
          <span className="text-emerald-400">ANONYMIZED</span>
        </div>
      </div>
    </aside>
  );
};
