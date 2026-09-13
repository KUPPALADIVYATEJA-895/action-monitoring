import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import {
  Lightbulb,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface BrainstormMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const BrainstormPage: React.FC = () => {
  const { stats, people, events } = useMonitoring();
  const [messages, setMessages] = useState<BrainstormMessage[]>([
    {
      role: 'assistant',
      content:
        "Welcome to the AI Activity Brainstorm Engine. I am your generative innovation assistant. I can help explore new computer-vision metrics, ergonomic anomaly detections, custom zone alerts, dataset enrichment, and cutting-edge operational features for this monitoring pipeline. How can we improve this monitoring system?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'How can we detect slip-and-fall or rapid collapse anomalies?',
    'What new activity categories could be added using the 17 COCO keypoints?',
    'Suggest zone-based alerting policies for high-traffic areas.',
    'How can we improve occluded multi-person tracking under crowded conditions?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: BrainstormMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            totalPeople: stats.totalPeople,
            activities: {
              standing: stats.standing,
              sitting: stats.sitting,
              walking: stats.walking,
              running: stats.running,
              phone: stats.usingPhone,
            },
            recordedTransitions: events.length,
          },
        }),
      });

      const data = await response.json();
      const replyContent =
        data.ideas ||
        data.content ||
        'Here are innovative ways to enhance the monitoring system: 1. Add temporal fall detection using sudden vertical acceleration of the hip keypoint. 2. Implement heatmaps for dwell-time accumulation. 3. Establish cross-camera re-identification embeddings.';

      const botMsg: BrainstormMessage = {
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Brainstorm API error:', err);
      const fallbackMsg: BrainstormMessage = {
        role: 'assistant',
        content:
          "System recommendations:\n1. Activity Transition Probability Matrix: Track likelihood of transition between posture states.\n2. Fall & Collapse Anomaly Triggers: Monitor high downward vertical velocity of hip keypoint (KP 11 & 12) followed by stationary horizontal torso.\n3. Virtual Boundary / Geofence Zones: Define polygon boundaries to classify movement inside sensitive perimeters.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col justify-between">
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2.5">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>BRAINSTORM MODE // GEMINI AI INNOVATION ASSISTANT</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Creative feature discovery, novel CV metrics, and system expansion recommendations
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/40 text-amber-400">
            CREATIVE DISCOVERY MODE
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/40 px-3 py-1.5 rounded-lg transition-all text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 my-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-xl p-4 text-xs font-mono leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-950/60 border border-cyan-800/50 text-slate-100'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1.5 opacity-60 text-[10px]">
                <span className="font-bold uppercase tracking-wider">
                  {msg.role === 'user' ? 'USER OPERATOR' : 'BRAINSTORM AI AGENT'}
                </span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-400 flex items-center gap-2">
              <span>Generating creative architecture ideas with Gemini 3.8 Flash...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 shrink-0 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          placeholder="Ask for new features, alerts, novel metrics, or research ideas..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>IDEATE</span>
        </button>
      </form>
    </div>
  );
};
