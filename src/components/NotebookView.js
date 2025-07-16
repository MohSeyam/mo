import React, { useContext } from 'react';
import { AppContext } from '../components/App';
import { useTranslation } from 'react-i18next';
import { serializeHtml } from '@udecode/plate-serializer-html';

function NotebookView({ rtl }) {
  const { appState, planData } = useContext(AppContext);
  const { i18n } = useTranslation();
  // جمع جميع الملاحظات مع بياناتها
  const notes = [];
  planData.forEach(week => {
    week.days.forEach((day, dayIdx) => {
      if (appState.notes?.[week.week]?.days?.[dayIdx]) {
        Object.entries(appState.notes[week.week].days[dayIdx]).forEach(([taskId, note]) => {
          const task = day.tasks.find(t => t.id === taskId);
          notes.push({
            ...note,
            week: week.week,
            weekTitle: week.title[i18n.language],
            day: day.day[i18n.language],
            dayKey: day.key,
            task,
            taskTitle: task?.description?.[i18n.language] || '',
            date: note.updatedAt || '',
            tags: note.keywords || [],
            type: 'note',
          });
        });
      }
    });
  });
  // جمع جميع التدوينات مع بياناتها
  const journals = [];
  planData.forEach(week => {
    week.days.forEach((day, dayIdx) => {
      const journal = appState.journal?.[week.week]?.days?.[dayIdx];
      if (journal) {
        journals.push({
          ...journal,
          week: week.week,
          weekTitle: week.title[i18n.language],
          day: day.day[i18n.language],
          dayKey: day.key,
          date: journal.updatedAt || '',
          type: 'journal',
        });
      }
    });
  });
  // دمج وترتيب حسب التاريخ تنازليًا
  const all = [...notes, ...journals].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">{i18n.language === 'ar' ? 'دفتر الملاحظات والتدوينات' : 'Notebook & Journals'}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {all.length === 0 && (
          <div className="col-span-2 text-center text-gray-500 py-12">{i18n.language === 'ar' ? 'لا توجد ملاحظات أو تدوينات بعد.' : 'No notes or journals yet.'}</div>
        )}
        {all.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-2 hover:scale-[1.01] transition">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.type==='note' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.type === 'note' ? (i18n.language === 'ar' ? 'ملاحظة' : 'Note') : (i18n.language === 'ar' ? 'تدوينة' : 'Journal')}</span>
              <span className="text-xs text-gray-400">{item.date ? new Date(item.date).toLocaleString(i18n.language) : ''}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{i18n.language === 'ar' ? 'الأسبوع:' : 'Week:'} {item.weekTitle}</span>
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{i18n.language === 'ar' ? 'اليوم:' : 'Day:'} {item.day}</span>
              {item.taskTitle && <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{i18n.language === 'ar' ? 'المهمة:' : 'Task:'} {item.taskTitle}</span>}
              {item.tags && item.tags.length > 0 && item.tags.map((tag, i) => (
                <span key={i} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">#{tag}</span>
              ))}
            </div>
            <div className="font-bold text-lg text-blue-700 dark:text-blue-200 mt-1 mb-2">{item.title || (item.type==='journal' ? (i18n.language === 'ar' ? 'تدوينة' : 'Journal') : (i18n.language === 'ar' ? 'ملاحظة' : 'Note'))}</div>
            <div className="prose prose-blue dark:prose-invert max-w-none text-sm" dir={rtl ? 'rtl' : 'ltr'}>
              {item.type === 'note'
                ? <div dangerouslySetInnerHTML={{ __html: serializeHtml(item.content ? JSON.parse(item.content) : [{ type: 'p', children: [{ text: '' }] }]) }} />
                : <div style={{whiteSpace:'pre-line'}}>{item.content}</div>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotebookView;