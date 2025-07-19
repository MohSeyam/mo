import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaForward, FaClock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const DEFAULTS = {
  work: 25 * 60, // 25 min
  shortBreak: 5 * 60, // 5 min
  longBreak: 15 * 60, // 15 min
  sessionsBeforeLong: 4,
};

function PomodoroTimer({ task, onSessionComplete, rtl, onTaskDone, onClose }) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState('work'); // work | short | long
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef();
  const [showExtraInput, setShowExtraInput] = useState(false);
  const [extraMinutes, setExtraMinutes] = useState(5);

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

  const total = mode === 'work' ? DEFAULTS.work : mode === 'short' ? DEFAULTS.shortBreak : DEFAULTS.longBreak;
  const progress = 100 - (secondsLeft / total) * 100;

  const color = mode === 'work' ? 'blue' : mode === 'short' ? 'green' : 'purple';

  const labels = {
    work: { en: 'Work', ar: 'عمل' },
    short: { en: 'Short Break', ar: 'استراحة قصيرة' },
    long: { en: 'Long Break', ar: 'استراحة طويلة' },
  };

  function handleTaskDone() {
    if (onTaskDone && task?.id) onTaskDone(task.id);
    if (onClose) onClose();
  }

  function handleExtraTime() {
    setShowExtraInput(true);
  }

  function confirmExtraTime() {
    setMode('work');
    setSecondsLeft(extraMinutes * 60);
    setIsRunning(true);
    setShowExtraInput(false);
  }

  // Tailwind's JIT compiler needs to see the full class names, so dynamic construction like `bg-${color}-100` might not work.
  // We'll use a map to ensure the classes are present in the final CSS.
  const colorClasses = {
    blue: {
      border: 'border-blue-300',
      text: 'text-blue-500',
      textDark: 'dark:text-blue-300',
      bgLight: 'bg-blue-100',
      bgHover: 'hover:bg-blue-200',
      textLight: 'text-blue-700',
      stroke: 'stroke-blue-500'
    },
    green: {
      border: 'border-green-300',
      text: 'text-green-500',
      textDark: 'dark:text-green-300',
      bgLight: 'bg-green-100',
      bgHover: 'hover:bg-green-200',
      textLight: 'text-green-700',
      stroke: 'stroke-green-500'
    },
    purple: {
      border: 'border-purple-300',
      text: 'text-purple-500',
      textDark: 'dark:text-purple-300',
      bgLight: 'bg-purple-100',
      bgHover: 'hover:bg-purple-200',
      textLight: 'text-purple-700',
      stroke: 'stroke-purple-500'
    }
  };
  const currentColors = colorClasses[color];

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl border-2 ${currentColors.border} bg-white dark:bg-gray-900 w-full max-w-xs mx-auto`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-2">
        <FaClock className={`text-2xl ${currentColors.text}`} />
        <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{labels[mode][i18n.language]}</span>
      </div>
      <div className="relative my-4">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r="60" strokeWidth="12" fill="none" className="stroke-gray-200 dark:stroke-gray-700" />
          <circle cx="70" cy="70" r="60" strokeWidth="12" fill="none" className={currentColors.stroke} strokeDasharray={2 * Math.PI * 60} strokeDashoffset={((100 - progress) / 100) * 2 * Math.PI * 60} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-mono ${currentColors.text} ${currentColors.textDark}`}>{format(secondsLeft)}</span>
        </div>
      </div>
      <div className="flex gap-4 my-2">
        <button onClick={handleStartPause} className={`p-3 rounded-full ${currentColors.bgLight} ${currentColors.bgHover} ${currentColors.textLight} text-xl`}>
          {isRunning ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={handleReset} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl"><FaRedo /></button>
        <button onClick={handleSkip} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl"><FaForward /></button>
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={handleTaskDone} className="px-4 py-1 rounded bg-green-600 text-white font-bold hover:bg-green-700">
          {i18n.language === 'ar' ? 'تم' : 'Done'}
        </button>
        <button onClick={handleExtraTime} className="px-4 py-1 rounded bg-orange-500 text-white font-bold hover:bg-orange-600">
          {i18n.language === 'ar' ? 'وقت إضافي' : 'Extra Time'}
        </button>
      </div>
      {showExtraInput && (
        <div className="flex flex-col items-center gap-2 mt-3">
          <label className="text-sm text-gray-700 dark:text-gray-200">{i18n.language === 'ar' ? 'حدد الدقائق:' : 'Set minutes:'}</label>
          <input type="number" min={1} max={120} value={extraMinutes} onChange={e => setExtraMinutes(Number(e.target.value))} className="w-20 px-2 py-1 rounded border bg-gray-50 dark:bg-gray-800" />
          <button onClick={confirmExtraTime} className="px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-700">{i18n.language === 'ar' ? 'ابدأ' : 'Start'}</button>
        </div>
      )}
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {i18n.language === 'ar' ? `عدد الجلسات: ${sessionCount}` : `Sessions: ${sessionCount}`}
      </div>
    </div> // --- FIX: Added the missing closing div tag ---
  );
}

export default PomodoroTimer;
