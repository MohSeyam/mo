import React, { useState, useMemo, useContext, useRef } from 'react';
import { AppContext } from '../components/App';
import DayView from './components/DayView';
import PlanTemplate from '../components/PlanTemplate';

function WeekCard({ week }) {
  const { lang, appState, setAppState, translations, Icons, setModal, showToast, rtl } = useContext(AppContext);
  const t = translations[lang];
  const [activeDayKey, setActiveDayKey] = useState(week.days[0].key);
  const activeDayIndex = useMemo(() => week.days.findIndex(d => d.key === activeDayKey), [week, activeDayKey]);
  const activeDayData = week.days[activeDayIndex];
  const [modal, setLocalModal] = useState({ open: false, content: null });

  // حساب إحصائيات الأسبوع
  const stats = useMemo(() => {
    let totalTasks = 0, completedTasks = 0, totalTime = 0, notesCount = 0, journalCount = 0, resourcesCount = 0;
    const sectionStats = {};
    const tagStats = {};
    week.days.forEach((day, dayIndex) => {
      day.tasks.forEach((task, taskIndex) => {
        totalTasks++;
        totalTime += task.duration || 0;
        if (!sectionStats[task.type]) sectionStats[task.type] = 0;
        sectionStats[task.type]++;
        if (task.keywords) task.keywords.forEach(tag => { tagStats[tag] = (tagStats[tag] || 0) + 1; });
        const dayState = appState?.progress?.[week.week]?.days?.[dayIndex];
        if (dayState?.tasks?.[taskIndex] === 'completed') completedTasks++;
      });
      resourcesCount += (day.resources?.length || 0);
      const dayNotes = appState?.notes?.[week.week]?.days?.[dayIndex];
      if(dayNotes) notesCount += Object.keys(dayNotes).length;
      const dayJournal = appState?.journal?.[week.week]?.days?.[dayIndex];
      if(dayJournal) journalCount++;
    });
    return { totalTasks, completedTasks, totalTime, notesCount, journalCount, resourcesCount, sectionStats, tagStats };
  }, [appState, week]);
  const isAllComplete = stats.totalTasks === stats.completedTasks && stats.totalTasks > 0;
  const logo = null;
  const charts = null;

  function handlePrint(ref) {
    if (ref && ref.current) {
      const printContents = ref.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Print</title></head><body>' + printContents + '</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }
  function openPlanTemplate() {
    setLocalModal({
      open: true,
      content: <PlanTemplate logo={logo} stats={stats} charts={charts} isAllComplete={isAllComplete} rtl={rtl} lang={lang} onPrint={handlePrint} />
    });
  }
  function Modal({ open, content, onClose }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full relative">
          <button onClick={onClose} className="absolute top-2 left-2 text-gray-500 hover:text-gray-700">&times;</button>
          {content}
        </div>
      </div>
    );
  }

  if (!week) return <div>{t.week} not found.</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{week.title[lang]}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{week.objective[lang]}</p>
          </div>
          <button onClick={openPlanTemplate} className="px-3 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-sm font-medium">{lang === 'ar' ? 'ملخص الأسبوع' : 'Week Summary'}</button>
        </div>
      </div>
      <div className="md:flex">
        <nav className="md:w-1/4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 p-4">
          <ul className="space-y-1">
            {week.days.map((day) => (
              <li key={day.key}>
                <button
                  onClick={() => setActiveDayKey(day.key)}
                  className={`w-full text-right rtl:text-left p-3 rounded-lg font-medium text-sm transition-colors ${activeDayKey === day.key
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                >
                  {day.day[lang]}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1 p-6">
          <DayView
            weekId={week.week}
            dayIndex={activeDayIndex}
            dayData={activeDayData}
            appState={appState}
            setAppState={setAppState}
            Icons={Icons}
            setModal={setModal}
            rtl={rtl}
            showToast={showToast}
          />
        </div>
      </div>
      <Modal open={modal.open} content={modal.content} onClose={() => setLocalModal({ open: false, content: null })} />
    </div>
  );
}

export default WeekCard;