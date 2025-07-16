import React, { useRef } from 'react';

export default function PlanTemplate({
  logo,
  stats,
  charts,
  isAllComplete,
  rtl,
  lang,
  onPrint
}) {
  const templateRef = useRef();
  return (
    <div ref={templateRef} className={`bg-white p-8 rounded-xl shadow-xl border ${rtl ? 'rtl' : ''} max-w-3xl mx-auto`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <div>{logo}</div>
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'ملخص الخطة' : 'Plan Summary'}</h2>
        {isAllComplete && (
          <button onClick={() => onPrint(templateRef)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 print:hidden">
            {lang === 'ar' ? 'طباعة' : 'Print'}
          </button>
        )}
      </div>
      {!isAllComplete && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
          {lang === 'ar' ? 'لم تكتمل جميع المهام بعد.' : 'Not all tasks are complete.'}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="font-semibold">{lang === 'ar' ? 'عدد المهام' : 'Total Tasks'}: {stats.totalTasks}</div>
          <div className="font-semibold">{lang === 'ar' ? 'المهام المنجزة' : 'Completed Tasks'}: {stats.completedTasks}</div>
          <div className="font-semibold">{lang === 'ar' ? 'الوقت الكلي' : 'Total Time'}: {stats.totalTime} {lang === 'ar' ? 'دقيقة' : 'min'}</div>
          <div className="font-semibold">{lang === 'ar' ? 'عدد الملاحظات' : 'Notes'}: {stats.notesCount}</div>
          <div className="font-semibold">{lang === 'ar' ? 'عدد التدوينات' : 'Journals'}: {stats.journalCount}</div>
          <div className="font-semibold">{lang === 'ar' ? 'عدد الموارد' : 'Resources'}: {stats.resourcesCount}</div>
        </div>
        <div>{charts}</div>
      </div>
      <div className="mb-4">
        <h3 className="font-bold mb-2">{lang === 'ar' ? 'إحصائيات الأقسام' : 'Section Stats'}</h3>
        <ul className="list-disc pl-5 rtl:pr-5">
          {Object.entries(stats.sectionStats).map(([section, value]) => (
            <li key={section}>{section}: {value}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2">{lang === 'ar' ? 'إحصائيات الوسوم' : 'Tag Stats'}</h3>
        <ul className="list-disc pl-5 rtl:pr-5">
          {Object.entries(stats.tagStats).map(([tag, value]) => (
            <li key={tag}>{tag}: {value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}