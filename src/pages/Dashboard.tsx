import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { StatsCard } from '../components/StatsCard';
import { PersonOverlay } from '../components/CameraMonitor/PersonOverlay';
import { ActivityBadge } from '../components/ActivityBadge';
import {
  Users,
  Footprints,
  User,
  Armchair,
  Zap,
  Phone,
  Package,
  Clock,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  onNavigateToMonitor: () => void;
  onNavigateToPeople: () => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  onNavigateToMonitor,
  onNavigateToPeople,
}) => {
  const { stats, people, events, setSelectedPersonId } = useMonitoring();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Health Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>OPERATIONAL MONITORING DASHBOARD</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time human activity detection, COCO-17 pose kinematics, and multi-person tracking telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToMonitor}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/20"
          >
            <span>OPEN LIVE MONITOR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-Time Stats Grid (Requirement #19) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <StatsCard
          label="TOTAL PEOPLE"
          value={String(stats.totalPeople).padStart(2, '0')}
          subValue="Active Tracks"
          icon={<Users className="w-4 h-4 text-cyan-400" />}
          color="cyan"
        />
        <StatsCard
          label="MOVING"
          value={String(stats.moving).padStart(2, '0')}
          subValue="In Motion"
          icon={<Footprints className="w-4 h-4 text-emerald-400" />}
          color="emerald"
        />
        <StatsCard
          label="NOT MOVING"
          value={String(stats.notMoving).padStart(2, '0')}
          subValue="Stationary"
          icon={<Clock className="w-4 h-4 text-slate-400" />}
          color="slate"
        />
        <StatsCard
          label="STANDING"
          value={String(stats.standing).padStart(2, '0')}
          subValue="Upright"
          icon={<User className="w-4 h-4 text-blue-400" />}
          color="cyan"
        />
        <StatsCard
          label="SITTING"
          value={String(stats.sitting).padStart(2, '0')}
          subValue="Resting"
          icon={<Armchair className="w-4 h-4 text-indigo-400" />}
          color="purple"
        />
        <StatsCard
          label="WALKING"
          value={String(stats.walking).padStart(2, '0')}
          subValue="Pacing"
          icon={<Footprints className="w-4 h-4 text-emerald-400" />}
          color="emerald"
        />
        <StatsCard
          label="RUNNING"
          value={String(stats.running).padStart(2, '0')}
          subValue="High Speed"
          icon={<Zap className="w-4 h-4 text-amber-400" />}
          color="amber"
        />
        <StatsCard
          label="USING PHONE"
          value={String(stats.usingPhone).padStart(2, '0')}
          subValue="Hand/Ear Pose"
          icon={<Phone className="w-4 h-4 text-purple-400" />}
          color="purple"
        />
        <StatsCard
          label="HOLDING OBJECT"
          value={String(stats.holdingObject).padStart(2, '0')}
          subValue="Bag/Bottle/Etc"
          icon={<Package className="w-4 h-4 text-cyan-400" />}
          color="cyan"
        />
        <StatsCard
          label="INTERACTION"
          value={String(stats.interacting).padStart(2, '0')}
          subValue="Proximity Pair"
          icon={<Users className="w-4 h-4 text-rose-400" />}
          color="rose"
        />
      </div>

      {/* Main Row: Live Feed Mini Preview + Active People Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Camera Feed Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400">
              LIVE CAMERA FEED
            </span>
            <button
              onClick={onNavigateToMonitor}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>EXPAND MONITOR</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-[360px]">
            <PersonOverlay />
          </div>
        </div>

        {/* Active People Roster (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold uppercase text-slate-300">
                ACTIVE PEOPLE ({people.length})
              </span>
              <button
                onClick={onNavigateToPeople}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
              >
                VIEW ALL →
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {people.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No active people detected in camera scope.
                </div>
              ) : (
                people.map((person) => {
                  const mins = Math.floor(person.activityDurationSeconds / 60);
                  const secs = person.activityDurationSeconds % 60;
                  const duration = `${String(mins).padStart(2, '0')}:${String(
                    secs
                  ).padStart(2, '0')}`;

                  return (
                    <div
                      key={person.id}
                      onClick={() => {
                        setSelectedPersonId(person.id);
                        onNavigateToMonitor();
                      }}
                      className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: person.color }}
                        />
                        <span className="font-mono font-bold text-sm text-slate-200">
                          {person.id}
                        </span>
                        <ActivityBadge
                          activity={person.activity}
                          movement={person.movement}
                          size="sm"
                        />
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-medium text-slate-200">
                          {duration}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {Math.round(person.confidence * 100)}% CONF
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>TRACKING PROTOCOL: SORT-CENTROID</span>
            <span className="text-emerald-400">FPS: {stats.fps}</span>
          </div>
        </div>
      </div>

      {/* Real-time Activity Timeline / Event Stream */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-mono font-semibold uppercase text-slate-300">
            RECENT ACTIVITY TRANSITIONS & EVENTS
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            LIVE SYNC BUFFER
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs font-mono">
            No activity transition events recorded yet. Transitions occur when a person changes activity state.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {events.slice(0, 6).map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-cyan-400">{evt.personId}</span>
                  <span className="text-[10px]">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-slate-200 truncate">{evt.details}</div>
                <div className="text-[10px] text-emerald-400">
                  CONFIDENCE: {Math.round(evt.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
