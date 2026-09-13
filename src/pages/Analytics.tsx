import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Clock } from 'lucide-react';

const COLORS = [
  '#06b6d4', // Cyan (Standing)
  '#6366f1', // Indigo (Sitting)
  '#10b981', // Emerald (Walking)
  '#f59e0b', // Amber (Running)
  '#a855f7', // Purple (Phone)
  '#14b8a6', // Teal (Object)
  '#f43f5e', // Rose (Interaction)
  '#64748b', // Slate (Unknown)
];

export const AnalyticsPage: React.FC = () => {
  const { stats, people, events } = useMonitoring();

  // Activity distribution data for Pie Chart
  const activityPieData = [
    { name: 'Standing', value: Math.max(stats.standing, 1) },
    { name: 'Sitting', value: Math.max(stats.sitting, 1) },
    { name: 'Walking', value: Math.max(stats.walking, 1) },
    { name: 'Running', value: stats.running },
    { name: 'Phone', value: stats.usingPhone },
    { name: 'Holding Obj', value: stats.holdingObject },
    { name: 'Interaction', value: stats.interacting },
  ].filter((d) => d.value > 0);

  // Movement distribution
  const movementData = [
    { name: 'Moving', count: stats.moving, fill: '#10b981' },
    { name: 'Not Moving', count: stats.notMoving, fill: '#64748b' },
  ];

  // People count over simulated / real temporal ticks
  const timelineData = [
    { time: '10:00', count: 3, moving: 1 },
    { time: '10:05', count: 4, moving: 2 },
    { time: '10:10', count: 4, moving: 2 },
    { time: '10:15', count: 5, moving: 3 },
    { time: '10:20', count: 6, moving: 4 },
    { time: '10:25', count: 5, moving: 3 },
    { time: '10:30', count: Math.max(stats.totalPeople, 3), moving: stats.moving },
  ];

  // Hourly Activity Estimation
  const hourlyData = [
    { hour: '08:00', standing: 12, walking: 8, sitting: 15 },
    { hour: '10:00', standing: 18, walking: 14, sitting: 22 },
    { hour: '12:00', standing: 25, walking: 30, sitting: 18 },
    { hour: '14:00', standing: 15, walking: 20, sitting: 35 },
    { hour: '16:00', standing: 20, walking: 25, sitting: 28 },
    { hour: '18:00', standing: 14, walking: 18, sitting: 10 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>VISUAL ANALYTICS & STATISTICAL REPORTS</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Quantitative charts depicting activity distributions, movement patterns, and timeline trends
        </p>
      </div>

      {/* Primary Charts Row: Activity Breakdown (Donut) + Movement Comparison (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Distribution Donut Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>CURRENT ACTIVITY DISTRIBUTION</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">LIVE COHORT</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {activityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Movement Distribution */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>DYNAMIC MOVEMENT STATE COMPARISON</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">TEMPORAL WINDOW</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
                  {movementData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts Row: People Count Over Time + Hourly Activity Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* People Count Trend Line Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>PEOPLE TRAFFIC DENSITY OVER TIME</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">REAL-TIME TRAJECTORY</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Total People"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#06b6d4' }}
                />
                <Line
                  type="monotone"
                  dataKey="moving"
                  name="In Motion"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Posture Breakdown Stacked Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-300">
              HOURLY POSTURAL COMPARISON (HISTORICAL)
            </span>
            <span className="text-[10px] font-mono text-slate-500">AGGREGATED SESSIONS</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="standing" name="Standing" fill="#06b6d4" stackId="a" />
                <Bar dataKey="walking" name="Walking" fill="#10b981" stackId="a" />
                <Bar dataKey="sitting" name="Sitting" fill="#6366f1" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
