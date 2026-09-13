import React from 'react';
import { MonitoringProvider } from './context/MonitoringContext';
import { Header } from './components/Header';
import { PersonOverlay } from './components/CameraMonitor/PersonOverlay';

export default function App() {
  return (
    <MonitoringProvider>
      <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans select-none antialiased overflow-hidden">
        {/* Top Minimal AI Header */}
        <Header />

        {/* Full-Page Immersive AI Camera Viewport */}
        <main className="flex-1 relative w-full h-[calc(100vh-3.5rem)] overflow-hidden">
          <PersonOverlay />
        </main>
      </div>
    </MonitoringProvider>
  );
}
