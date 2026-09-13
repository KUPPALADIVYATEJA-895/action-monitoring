import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { ActivityBadge } from '../components/ActivityBadge';
import { TrackedPerson, SKELETON_PAIRS } from '../types';
import {
  Users,
  Search,
  Eye,
  Clock,
  Activity,
  Package,
  Layers,
  Calendar,
  X,
} from 'lucide-react';

export const PeoplePage: React.FC = () => {
  const { people, selectedPerson, setSelectedPersonId } = useMonitoring();
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectModalPerson, setInspectModalPerson] = useState<TrackedPerson | null>(null);

  const filteredPeople = people.filter(
    (p) =>
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.movement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeInspectPerson = inspectModalPerson || selectedPerson;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>ANONYMOUS PEOPLE DIRECTORY</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time track records, cumulative activity logs, and COCO kinematic pose breakdowns
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search ID or activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3">PERSON ID</th>
                <th className="px-5 py-3">CURRENT ACTIVITY</th>
                <th className="px-5 py-3">MOVEMENT STATE</th>
                <th className="px-5 py-3">CURRENT DURATION</th>
                <th className="px-5 py-3">CONFIDENCE</th>
                <th className="px-5 py-3">FIRST SEEN</th>
                <th className="px-5 py-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No matching people currently detected.
                  </td>
                </tr>
              ) : (
                filteredPeople.map((person) => {
                  const mins = Math.floor(person.activityDurationSeconds / 60);
                  const secs = person.activityDurationSeconds % 60;
                  const durationStr = `${String(mins).padStart(2, '0')}:${String(
                    secs
                  ).padStart(2, '0')}`;

                  return (
                    <tr
                      key={person.id}
                      className="hover:bg-slate-850/50 transition-colors cursor-pointer"
                      onClick={() => setInspectModalPerson(person)}
                    >
                      <td className="px-5 py-3 font-bold text-slate-100 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: person.color }}
                        />
                        <span>{person.id}</span>
                      </td>
                      <td className="px-5 py-3">
                        <ActivityBadge activity={person.activity} size="sm" />
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            person.movement === 'MOVING'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {person.movement}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-300 font-medium">
                        {durationStr}
                      </td>
                      <td className="px-5 py-3 text-emerald-400 font-semibold">
                        {Math.round(person.confidence * 100)}%
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[11px]">
                        {new Date(person.firstSeen).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectModalPerson(person);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-slate-700 hover:border-cyan-800 text-[11px] transition-all"
                        >
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Inspection Drawer / Modal (Requirement #20) */}
      {activeInspectPerson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: activeInspectPerson.color }}
                />
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-mono">
                    PERSON PROFILE // {activeInspectPerson.id}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    FIRST DETECTED: {new Date(activeInspectPerson.firstSeen).toLocaleTimeString()} • LAST SEEN: {new Date(activeInspectPerson.lastSeen).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setInspectModalPerson(null);
                  setSelectedPersonId(null);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current State Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">ACTIVITY</span>
                <span className="text-sm font-bold text-slate-100">
                  {activeInspectPerson.activity}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">MOVEMENT</span>
                <span
                  className={`text-sm font-bold ${
                    activeInspectPerson.movement === 'MOVING'
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {activeInspectPerson.movement}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">DURATION</span>
                <span className="text-sm font-bold text-cyan-400">
                  {activeInspectPerson.activityDurationSeconds}s
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">CONFIDENCE</span>
                <span className="text-sm font-bold text-purple-400">
                  {Math.round(activeInspectPerson.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Visual Pose Wireframe Representation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>COCO-17 KEYPOINT SKELETON WIREFRAME</span>
              </span>

              <div className="flex items-center justify-center bg-slate-900/60 rounded-lg p-3">
                <svg
                  viewBox="0 0 240 280"
                  className="w-48 h-56 stroke-cyan-400 fill-cyan-400"
                >
                  {/* Render wireframe from active person's normalized keypoints */}
                  {(() => {
                    const kps = activeInspectPerson.keypoints;
                    if (!kps || kps.length < 17) {
                      return (
                        <text x="120" y="140" fill="#64748b" textAnchor="middle" fontSize="12">
                          Pose keypoints unavailable
                        </text>
                      );
                    }

                    // Compute normalized coordinates inside 240x280 box
                    const bbox = activeInspectPerson.bbox;
                    const mapX = (x: number) =>
                      30 + ((x - bbox.x) / Math.max(bbox.width, 1)) * 180;
                    const mapY = (y: number) =>
                      30 + ((y - bbox.y) / Math.max(bbox.height, 1)) * 220;

                    return (
                      <g>
                        {/* Bones */}
                        {SKELETON_PAIRS.map(([a, b], idx) => {
                          const kpA = kps[a];
                          const kpB = kps[b];
                          if (!kpA || !kpB) return null;
                          return (
                            <line
                              key={idx}
                              x1={mapX(kpA.x)}
                              y1={mapY(kpA.y)}
                              x2={mapX(kpB.x)}
                              y2={mapY(kpB.y)}
                              stroke="#06b6d4"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          );
                        })}

                        {/* Joints */}
                        {kps.map((kp, idx) => (
                          <circle
                            key={idx}
                            cx={mapX(kp.x)}
                            cy={mapY(kp.y)}
                            r={idx === 0 ? 5 : 3.5}
                            fill={idx === 0 ? '#ffffff' : activeInspectPerson.color}
                            stroke="#0f172a"
                            strokeWidth="1"
                          />
                        ))}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Activity History Timeline */}
            <div className="space-y-2 font-mono">
              <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>ACTIVITY HISTORY TIMELINE ({activeInspectPerson.activityHistory.length} ENTRIES)</span>
              </span>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {activeInspectPerson.activityHistory.length === 0 ? (
                  <div className="py-4 text-center text-slate-500 text-xs italic">
                    Currently performing first continuous activity ({activeInspectPerson.activity})
                  </div>
                ) : (
                  activeInspectPerson.activityHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ActivityBadge activity={hist.activity} movement={hist.movement} size="sm" />
                      </div>
                      <div className="text-slate-400">
                        <span>{hist.durationSeconds}s duration</span>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {new Date(hist.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
