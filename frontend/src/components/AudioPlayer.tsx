'use client';
import { useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play, RefreshCw, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AudioPlayer({ script }: { script: string }) {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const play = () => {
    if (!window.speechSynthesis) { toast.error('Text-to-speech not supported.'); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(script);
    utt.rate = 0.92; utt.pitch = 1; utt.lang = 'en-CA';
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setPlaying(true);
    utt.onend = () => { setPlaying(false); setPlayed(true); };
    utt.onerror = () => { setPlaying(false); toast.error('Audio playback failed.'); };
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const pause = () => { window.speechSynthesis.cancel(); setPlaying(false); };

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  return (
    <div className="card p-5 bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Headphones className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Listening Audio</span>
        {played && (
          <span className="ml-auto text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            ✓ Played
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-blue-200">
        <button
          onClick={playing ? pause : play}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
        >
          {playing
            ? <Pause className="w-5 h-5 text-white" />
            : <Play className="w-5 h-5 text-white ml-0.5" />}
        </button>

        <div className="flex-1">
          {playing ? (
            <div className="flex items-center gap-1.5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1 bg-blue-500 rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.sin(i * 0.8) * 8 + 8}px`,
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                  }}
                />
              ))}
              <span className="text-xs text-blue-600 ml-2 font-medium">Playing...</span>
            </div>
          ) : (
            <div>
              <div className="text-sm font-medium text-gray-700">
                {played ? 'Audio played — answer the question below' : 'Press play to listen to the audio'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Make sure your volume is on
              </div>
            </div>
          )}
        </div>

        {!played && !playing && (
          <button onClick={play} className="btn-primary btn-sm">
            <Play className="w-3.5 h-3.5" /> Play Audio
          </button>
        )}
        {played && !playing && (
          <button onClick={play} className="btn-secondary btn-sm text-xs">
            <RefreshCw className="w-3 h-3" /> Replay
          </button>
        )}
      </div>

      <p className="text-xs text-blue-600 mt-2">
        💡 In the real CELPIP exam, audio plays once. You may replay here for practice.
      </p>
    </div>
  );
}
