import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'chart.js/auto';

export default function MonthTemplate({
  logo,
  stats,
  charts,
  isAllComplete,
  rtl,
  lang,
  onPrint
}) {
  const templateRef = useRef();

  // إعداد بيانات الرسم البياني
  const barData = {
    labels: Object.keys(stats.sectionStats),
    datasets: [
      {
        label: lang === 'ar' ? 'عدد المهام' : 'Tasks',
        data: Object.values(stats.sectionStats),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E42', '#EF4444', '#8B5CF6', '#FBBF24', '#6366F1', '#14B8A6'
        ],
        borderRadius: 6,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: lang === 'ar' ? 'إحصائيات الأقسام' : 'Section Stats', font: { size: 16 } },
    },
    scales: {
      x: { grid: { color: 'rgba(128,128,128,0.1)' } },
      y: { grid: { color: 'rgba(128,128,128,0.1)' } },
    },
  };

  // إعداد بيانات الرسم البياني للوسوم
  const pieData = {
    labels: Object.keys(stats.tagStats),
    datasets: [
      {
        label: lang === 'ar' ? 'عدد الوسوم' : 'Tags',
        data: Object.values(stats.tagStats),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E42', '#EF4444', '#8B5CF6', '#FBBF24', '#6366F1', '#14B8A6', '#F472B6', '#FCD34D', '#A3E635', '#F87171'
        ],
        borderWidth: 2,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 14 } } },
      title: { display: true, text: lang === 'ar' ? 'إحصائيات الوسوم' : 'Tag Stats', font: { size: 16 } },
    },
  };

  // إعداد بيانات الرسم البياني الخطي (مثال: المهام المنجزة لكل يوم)
  const lineLabels = stats.timeSeriesLabels || [];
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: lang === 'ar' ? 'المهام المنجزة' : 'Completed Tasks',
        data: stats.timeSeriesData || [],
        fill: false,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: lang === 'ar' ? 'تقدم المهام عبر الأيام' : 'Tasks Progress Over Days', font: { size: 16 } },
    },
    scales: {
      x: { grid: { color: 'rgba(128,128,128,0.1)' } },
      y: { grid: { color: 'rgba(128,128,128,0.1)' } },
    },
  };

  // رسم بياني دائري لتوزيع وقت البومودورو على المهام مع اسم المهمة والقسم
  let pomodoroPieData = null;
  let pomodoroPieOptions = null;
  if (stats.pomodoro && Object.keys(stats.pomodoro).length > 0 && stats.allTasks) {
    // بناء قائمة المهام المنجزة مع القسم
    const taskMap = {};
    stats.allTasks.forEach(task => {
      taskMap[task.id] = task;
    });
    const labels = Object.keys(stats.pomodoro).map(id => {
      const task = taskMap[id];
      if (!task) return id;
      const name = (task.description?.[lang] || task.description?.en || '').slice(0, 30) + (task.description?.[lang]?.length > 30 ? '…' : '');
      return `${name} (${task.type})`;
    });
    const data = Object.keys(stats.pomodoro).map(id => Math.floor((stats.pomodoro[id].totalSeconds || 0) / 60));
    const sectionColors = {
      'Blue Team': '#2563eb',
      'Red Team': '#ef4444',
      'Policies': '#a21caf',
      'Practical': '#22c55e',
      'Soft Skills': '#f59e42',
    };
    const bgColors = Object.keys(stats.pomodoro).map(id => {
      const task = taskMap[id];
      return sectionColors[task?.type] || '#6366F1';
    });
    pomodoroPieData = {
      labels,
      datasets: [
        {
          label: lang === 'ar' ? 'دقائق بومودورو لكل مهمة' : 'Pomodoro Minutes per Task',
          data,
          backgroundColor: bgColors,
          borderWidth: 2,
        },
      ],
    };
    pomodoroPieOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 13 } } },
        title: { display: true, text: lang==='ar'?'توزيع وقت بومودورو على المهام':'Pomodoro Time Distribution', font: { size: 16 } },
        tooltip: {
          callbacks: {
            label: function(context) {
              const idx = context.dataIndex;
              const id = Object.keys(stats.pomodoro)[idx];
              const task = taskMap[id];
              const minutes = data[idx];
              const sessions = stats.pomodoro[id]?.count || 0;
              return [
                `${lang==='ar'?'المهمة':'Task'}: ${task?.description?.[lang] || task?.description?.en || id}`,
                `${lang==='ar'?'القسم':'Section'}: ${task?.type || ''}`,
                `${lang==='ar'?'الجلسات':'Sessions'}: ${sessions}`,
                `${lang==='ar'?'الدقائق':'Minutes'}: ${minutes}`
              ];
            }
          }
        }
      }
    };
  }

  // تصدير PDF
  function handleExportPDF() {
    if (templateRef.current) {
      const doc = new jsPDF({ orientation: rtl ? 'rtl' : 'ltr', unit: 'pt', format: 'a4' });
      doc.html(templateRef.current, {
        callback: function (doc) {
          doc.save('month-summary.pdf');
        },
        x: 10,
        y: 10,
        html2canvas: { scale: 0.7 },
      });
    }
  }

  return (
    <div ref={templateRef} className={`bg-white p-8 rounded-xl shadow-xl border ${rtl ? 'rtl' : ''} max-w-3xl mx-auto`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">{logo}<span className="text-xl font-bold">{lang === 'ar' ? 'قالب ملخص الشهر' : 'Month Summary Template'}</span></div>
        {isAllComplete && (
          <div className="flex gap-2">
            <button onClick={() => onPrint(templateRef)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 print:hidden">
              {lang === 'ar' ? 'طباعة' : 'Print'}
            </button>
            <button onClick={handleExportPDF} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 print:hidden">
              {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
            </button>
          </div>
        )}
      </div>
      {!isAllComplete && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
          {lang === 'ar' ? 'لم تكتمل جميع المهام بعد.' : 'Not all tasks are complete.'}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="font-semibold">{lang === 'ar' ? 'عدد المهام' : 'Total Tasks'}: {stats.totalTasks}</div>
          <div className="font-semibold">{lang === 'ar' ? 'المهام المنجزة' : 'Completed Tasks'}: {stats.completedTasks}</div>
          <div className="font-semibold">{lang === 'ar' ? 'الوقت الكلي' : 'Total Time'}: {stats.totalTime} {lang === 'ar' ? 'دقيقة' : 'min'}</div>
          <div className="font-semibold">{lang === 'ar' ? 'عدد الملاحظات' : 'Notes'}: {stats.notesCount}</div>
          <div className="font-semibold">{lang === 'ar' ? 'عدد التدوينات' : 'Journals'}: {stats.journalCount}</div>
          <div className="font-semibold">{lang === 'ar' ? 'عدد الموارد' : 'Resources'}: {stats.resourcesCount}</div>
          {/* ملخص بومودورو */}
          {stats.pomodoroStats && (
            <div className="font-semibold text-orange-600 mt-2">
              {lang === 'ar'
                ? `إجمالي جلسات بومودورو: ${stats.pomodoroStats.totalSessions}، المدة: ${Math.floor(stats.pomodoroStats.totalMinutes)} دقيقة`
                : `Total Pomodoro: ${stats.pomodoroStats.totalSessions} sessions, ${Math.floor(stats.pomodoroStats.totalMinutes)} min`}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Bar data={barData} options={barOptions} />
          {Object.keys(stats.tagStats).length > 0 && <Pie data={pieData} options={pieOptions} />}
          {lineLabels.length > 1 && <Line data={lineData} options={lineOptions} />}
          {/* رسم بياني توزيع وقت البومودورو */}
          {pomodoroPieData && <Pie data={pomodoroPieData} options={pomodoroPieOptions} />}
        </div>
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