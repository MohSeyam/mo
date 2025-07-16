import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaForward, FaClock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const DEFAULTS = {
  work: 25 * 60, // 25 min
  shortBreak: 5 * 60, // 5 min
  longBreak: 15 * 60, // 15 min
  sessionsBeforeLong: 4,
};

function PomodoroTimer({ task, onSessionComplete, rtl }) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState('work'); // work | short | long
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((sec) => {
        if (sec > 0) return sec - 1;
        clearInterval(intervalRef.current);
        handleSessionEnd();
        return 0;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  useEffect(() => {
    if (mode === 'work') setSecondsLeft(DEFAULTS.work);
    else if (mode === 'short') setSecondsLeft(DEFAULTS.shortBreak);
    else setSecondsLeft(DEFAULTS.longBreak);
  }, [mode]);

  function handleSessionEnd() {
    if (mode === 'work') {
      setSessionCount((c) => c + 1);
      onSessionComplete && onSessionComplete(task?.id);
      if ((sessionCount + 1) % DEFAULTS.sessionsBeforeLong === 0) setMode('long');
      else setMode('short');
    } else {
      setMode('work');
    }
    setIsRunning(false);
  }

  function handleStartPause() {
    setIsRunning((r) => !r);
  }
  function handleReset() {
    setIsRunning(false);
    if (mode === 'work') setSecondsLeft(DEFAULTS.work);
    else if (mode === 'short') setSecondsLeft(DEFAULTS.shortBreak);
    else setSecondsLeft(DEFAULTS.longBreak);
  }
  function handleSkip() {
    setIsRunning(false);
    handleSessionEnd();
  }

  function format(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Progress for circle
  const total = mode === 'work' ? DEFAULTS.work : mode === 'short' ? DEFAULTS.shortBreak : DEFAULTS.longBreak;
  const progress = 100 - (secondsLeft / total) * 100;

  // Colors
  const color = mode === 'work' ? 'blue' : mode === 'short' ? 'green' : 'purple';

  // Labels
  const labels = {
    work: { en: 'Work', ar: 'عمل' },
    short: { en: 'Short Break', ar: 'استراحة قصيرة' },
    long: { en: 'Long Break', ar: 'استراحة طويلة' },
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl border-2 border-${color}-300 bg-white dark:bg-gray-900 w-full max-w-xs mx-auto`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-2">
        <FaClock className={`text-2xl text-${color}-500`} />
        <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{labels[mode][i18n.language]}</span>
      </div>
      <div className="relative my-4">
        <svg width="140" height="140">
          <circle cx="70" cy="70" r="60" stroke="#e5e7eb" strokeWidth="12" fill="none" />
          <circle cx="70" cy="70" r="60" stroke={`var(--tw-color-${color}-500, #3b82f6)`} strokeWidth="12" fill="none" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={((100 - progress) / 100) * 2 * Math.PI * 60} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono text-${color}-700 dark:text-${color}-300">{format(secondsLeft)}</span>
        </div>
      </div>
      <div className="flex gap-4 my-2">
        <button onClick={handleStartPause} className={`p-3 rounded-full bg-${color}-100 hover:bg-${color}-200 text-${color}-700 text-xl`}>
          {isRunning ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={handleReset} className={`p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl`}><FaRedo /></button>
        <button onClick={handleSkip} className={`p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl`}><FaForward /></button>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {i18n.language === 'ar' ? `عدد الجلسات: ${sessionCount}` : `Sessions: ${sessionCount}`}
      </div>
      {task && (
        <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">
          <span className="font-bold">{i18n.language === 'ar' ? 'المهمة:' : 'Task:'}</span> {task.description?.[i18n.language] || task.description?.en || ''}
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer;