import React from 'react';
import { MonitoringProvider } from './context/MonitoringContext';
import { Header } from './components/Header';
import { PersonOverlay } from './components/CameraMonitor/PersonOverlay';
import { LiveActivityPanel } from './components/LiveActivityPanel';

export default function App() {
  return (
    <MonitoringProvider>
      <div className="flex flex-col min-h-screen w-screen bg-slate-950 text-slate-100 font-sans select-none antialiased">
        {/* Top Operational Status Header */}
        <Header />

        {/* Main Focused Workspace: Live Viewport + Real-Time Person Activity Panel */}
        <main className="flex-1 p-3 sm:p-5 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-5 items-stretch">
          {/* Left / Center: Camera Viewport with COCO-17 Overlays */}
          <div className="flex-1 flex flex-col min-h-[420px] lg:min-h-[560px]">
            <PersonOverlay />
          </div>

          {/* Right: Real-time Person Activity Details, Toggles & Timeline */}
          <div className="w-full lg:w-96 shrink-0">
            <LiveActivityPanel />
          </div>
        </main>
      </div>
    </MonitoringProvider>
  );
}
