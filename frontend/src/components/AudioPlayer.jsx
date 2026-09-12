import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function AudioPlayer({ word, audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.play().catch(() => speakWithTTS(word));
      audio.onended = () => setIsPlaying(false);
      return;
    }
    speakWithTTS(word);
  };

  const speakWithTTS = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;

    setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handlePlayAudio}
      disabled={isPlaying}
      title="सुनें सही उच्चारण (Audio Pronunciation)"
      className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm active:scale-95 ${
        isPlaying
          ? "bg-indigo-600 text-white scale-105 ring-4 ring-indigo-200 dark:ring-indigo-900"
          : "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
      }`}
    >
      {isPlaying ? (
        <VolumeX className="w-5 h-5 animate-pulse" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}
