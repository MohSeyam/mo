import React, { useState, useContext, useMemo } from 'react';
import SkillMatrix from './components/SkillMatrix';
import WeekCard from './components/WeekCard';
import AchievementsView from './components/AchievementsView';
import NotebookView from './components/NotebookView';
import LocalClock from './components/LocalClock';
import LocalCalendar from './components/LocalCalendar';
import Logo from './components/Logo';
import LogoArabic from './components/LogoArabic';
import MonthTemplate from './components/MonthTemplate';
import PhaseTemplate from './components/PhaseTemplate';
import PlanTemplate from './components/PlanTemplate';
import { useTranslation } from 'react-i18next';
import './index.css';
import { AppContext } from './components/App';
import { ToastProvider } from '../context/ToastContext';
import Toast from './Toast';
import { useToast } from '../context/ToastContext';
import { SpinnerProvider, useSpinner } from '../context/SpinnerContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { planData } from '../utils/tasks';

function App() {
  const { t, i18n } = useTranslation();
  const [rtl, setRtl] = useState(i18n.language === 'ar');
  const [view, setView] = useState('plan'); // plan | achievements | notebook
  const [modal, setModal] = useState({ open: false, content: null });
  const { appState } = useContext(AppContext);
  const { showToast } = useToast ? useToast() : { showToast: () => {} };
  const { showSpinner, hideSpinner } = useSpinner ? useSpinner() : { showSpinner: () => {}, hideSpinner: () => {} };
  const { theme, toggleTheme } = useTheme ? useTheme() : { theme: 'light', toggleTheme: () => {} };

  // تغيير اتجاه الصفحة عند تغيير اللغة
  React.useEffect(() => {
    setRtl(i18n.language === 'ar');
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const stats = useMemo(() => {
    let totalTasks = 0, completedTasks = 0, totalTime = 0, notesCount = 0, journalCount = 0, resourcesCount = 0;
    const sectionStats = {};
    const tagStats = {};
    planData.forEach(week => {
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
    });
    return { totalTasks, completedTasks, totalTime, notesCount, journalCount, resourcesCount, sectionStats, tagStats };
  }, [appState, planData]);
  const isAllComplete = stats.totalTasks === stats.completedTasks;
  const logo = i18n.language === 'ar' ? <LogoArabic size="2xl" /> : <Logo size="2xl" />;
  const charts = null; // ضع هنا رسم بياني مناسب
  const lang = i18n.language;

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

  function openMonthTemplate() {
    setModal({
      open: true,
      content: <MonthTemplate logo={logo} stats={stats} charts={charts} isAllComplete={isAllComplete} rtl={rtl} lang={lang} onPrint={handlePrint} />
    });
  }
  function openPhaseTemplate() {
    setModal({
      open: true,
      content: <PhaseTemplate logo={logo} stats={stats} charts={charts} isAllComplete={isAllComplete} rtl={rtl} lang={lang} onPrint={handlePrint} />
    });
  }
  function openPlanTemplate() {
    setModal({
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

  return (
    <ThemeProvider>
      <ToastProvider>
        <SpinnerProvider>
          <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-gray-900 ${rtl ? 'font-arabic' : ''} ${theme === 'dark' ? 'dark' : ''}`}>
            <header className="flex flex-col md:flex-row items-center justify-between px-4 py-4 bg-white dark:bg-gray-900 shadow">
              <div className={`flex flex-col md:flex-row items-center gap-4 w-full ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                {logo}
                <div className="flex-1 flex flex-col md:flex-row gap-2 items-center justify-end">
                  <LocalClock />
                  <LocalCalendar />
                </div>
              </div>
              <div className="flex gap-2 items-center mt-2 md:mt-0">
                <button onClick={toggleTheme} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{theme === 'dark' ? (lang === 'ar' ? 'وضع نهاري ☀️' : 'Light Mode ☀️') : (lang === 'ar' ? 'وضع ليلي 🌙' : 'Dark Mode 🌙')}</button>
                <button onClick={() => { showSpinner && showSpinner(); setTimeout(() => { i18n.changeLanguage('en'); hideSpinner && hideSpinner(); showToast && showToast('Language changed to English', 'success'); }, 1000); }} className={`px-3 py-1 rounded ${i18n.language==='en'?'bg-blue-600 text-white':'bg-gray-200'}`}>EN</button>
                <button onClick={() => { showSpinner && showSpinner(); setTimeout(() => { i18n.changeLanguage('ar'); hideSpinner && hideSpinner(); showToast && showToast('تم تغيير اللغة إلى العربية', 'success'); }, 1000); }} className={`px-3 py-1 rounded ${i18n.language==='ar'?'bg-blue-600 text-white':'bg-gray-200'}`}>العربية</button>
              </div>
            </header>
            <nav className="flex justify-center gap-4 py-4">
              <button onClick={()=>setView('plan')} className={`px-4 py-2 rounded ${view==='plan'?'bg-blue-500 text-white':'bg-gray-100'}`}>{t('Plan')}</button>
              <button onClick={()=>setView('achievements')} className={`px-4 py-2 rounded ${view==='achievements'?'bg-blue-500 text-white':'bg-gray-100'}`}>{t('Achievements')}</button>
              <button onClick={()=>setView('notebook')} className={`px-4 py-2 rounded ${view==='notebook'?'bg-blue-500 text-white':'bg-gray-100'}`}>{t('Notebook')}</button>
            </nav>
            <main className="max-w-5xl mx-auto px-2 py-6">
              <div className="flex gap-4 mb-4">
                <button onClick={openMonthTemplate} className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200">{lang === 'ar' ? 'عرض قالب الشهر' : 'Show Month Template'}</button>
                <button onClick={openPhaseTemplate} className="bg-green-100 text-green-800 px-4 py-2 rounded hover:bg-green-200">{lang === 'ar' ? 'عرض قالب المرحلة' : 'Show Phase Template'}</button>
                <button onClick={openPlanTemplate} className="bg-purple-100 text-purple-800 px-4 py-2 rounded hover:bg-purple-200">{lang === 'ar' ? 'عرض قالب الخطة' : 'Show Plan Template'}</button>
              </div>
              {view === 'plan' && (
                <div className="space-y-6">
                  <SkillMatrix planData={planData} />
                  {planData.map(week => (
                    <WeekCard key={week.week} week={week} rtl={rtl} />
                  ))}
                </div>
              )}
              {view === 'achievements' && <AchievementsView />}
              {view === 'notebook' && <NotebookView rtl={rtl} />}
            </main>
            <Modal open={modal.open} content={modal.content} onClose={() => setModal({ open: false, content: null })} />
            <Toast rtl={rtl} />
          </div>
        </SpinnerProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;