import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { ActivityBadge } from '../components/ActivityBadge';
import { ActivityType } from '../types';
import {
  Activity,
  Clock,
  Users,
  Repeat,
  TrendingUp,
  BarChart,
  ArrowRight,
} from 'lucide-react';

export const ActivitiesPage: React.FC = () => {
  const { people, stats, events } = useMonitoring();

  // Aggregate stats per activity type across all people and histories
  const activityCatalog: ActivityType[] = [
    'Standing',
    'Sitting',
    'Walking',
    'Running',
    'Using Phone',
    'Holding Object',
    'Interacting With Person',
    'Unknown',
  ];

  const activityStats = activityCatalog.map((act) => {
    // Current people doing this
    const currentCount = people.filter((p) => p.activity === act).length;

    // Total accumulated duration across active people + archived histories
    let totalSeconds = 0;
    let occurrences = 0;

    for (const p of people) {
      if (p.activity === act) {
        totalSeconds += p.activityDurationSeconds;
        occurrences++;
      }
      for (const h of p.activityHistory) {
        if (h.activity === act) {
          totalSeconds += h.durationSeconds;
          occurrences++;
        }
      }
    }

    const avgDuration = occurrences > 0 ? Math.round(totalSeconds / occurrences) : 0;

    // Formatted time string
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const formattedTotal =
      hrs > 0
        ? `${hrs} hr ${mins} min`
        : mins > 0
        ? `${mins} min ${secs}s`
        : `${secs}s`;

    return {
      name: act,
      currentCount,
      totalSeconds,
      formattedTotal,
      avgDuration: `${avgDuration}s`,
      occurrences,
    };
  });

  // Sort by total seconds descending
  const sortedActivities = [...activityStats].sort(
    (a, b) => b.totalSeconds - a.totalSeconds
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Title Banner */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span>ACTIVITY RECOGNITION ANALYTICS</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics on human postures, action duration distributions, and behavioral transition flows
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400 uppercase block">
            MOST PREVALENT ACTION
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-cyan-400">
              {sortedActivities[0]?.name || 'Standing'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            Accumulated {sortedActivities[0]?.formattedTotal} duration
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400 uppercase block">
            RECORDED TRANSITIONS
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {events.length}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            Dynamic posture change events
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400 uppercase block">
            ACTIVE COHORT
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-purple-400">
              {stats.totalPeople}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({stats.moving} Moving / {stats.notMoving} Stationary)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            Real-time monitored subjects
          </span>
        </div>
      </div>

      {/* Activity Breakdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activityStats.map((item) => (
          <div
            key={item.name}
            className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <ActivityBadge activity={item.name} size="md" />
              <span className="text-xs font-mono font-bold text-slate-300">
                {item.currentCount} Active
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>TOTAL TIME:</span>
                <span className="text-slate-100 font-semibold">{item.formattedTotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>AVG DURATION:</span>
                <span className="text-slate-200">{item.avgDuration}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>OCCURRENCES:</span>
                <span className="text-slate-400">{item.occurrences}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Transitions Log (Requirement #21) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-200 font-mono text-sm font-semibold">
            <Repeat className="w-4 h-4 text-cyan-400" />
            <span>ACTIVITY TRANSITION FLOW (CHRONOLOGICAL)</span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            TOTAL: {events.length}
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No posture transitions captured yet. Transition events are recorded automatically when subjects change activity state.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 font-mono">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-lg bg-slate-950/80 border border-slate-850 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                    {evt.personId}
                  </span>
                  <span className="text-slate-200">{evt.details}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-500">
                  <span className="text-emerald-400 text-[11px]">
                    {Math.round(evt.confidence * 100)}% CONF
                  </span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
