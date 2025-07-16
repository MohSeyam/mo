import React from 'react';
import { exportNoteAsMarkdown } from '../utils/noteUtils';

function NoteCard({ note, lang, onClick }) {
  const typeColors = {
    cyber: 'bg-blue-100 text-blue-800 border-blue-300',
    policy: 'bg-green-100 text-green-800 border-green-300',
    soft: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    general: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  const typeLabels = {
    cyber: 'سيبراني',
    policy: 'سياسة أمنية',
    soft: 'مهارة ناعمة',
    general: 'عام',
  };
  const handleExport = (e) => {
    e.stopPropagation();
    const md = `# ${note.title}\n\n**النوع:** ${typeLabels[note.templateType] || 'عام'}\n**التاجات:** ${(note.keywords||[]).join(', ')}\n**المهمة:** ${note.taskData?.title?.[lang] || ''}\n**اليوم:** ${note.dayData?.title || ''}\n**التاريخ:** ${(note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : '')}\n\n---\n\n${note.content}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'note'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition flex flex-col gap-2"
      onClick={() => onClick(note)}
    >
      <div className={`rounded px-2 py-1 text-xs font-bold border mb-2 w-fit ${typeColors[note.templateType] || typeColors.general}`}>{typeLabels[note.templateType] || 'عام'}</div>
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{note.title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : ''}</span>
        <button
          onClick={handleExport}
          title={lang === 'ar' ? 'تصدير' : 'Export'}
          className="ml-2 text-blue-500 hover:text-blue-700 text-lg"
        >
          ⬇️
        </button>
      </div>
      <div className="prose prose-sm dark:prose-invert max-h-32 overflow-y-auto" style={{ direction: 'rtl' }}
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
      <div className="mt-1 text-xs text-gray-700 dark:text-gray-200 font-semibold flex flex-wrap gap-2">
        <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5">{note.taskData?.title?.[lang]}</span>
        <span className="inline-block bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5">{note.dayData?.title}</span>
      </div>
    </div>
  );
}

export default NoteCard;