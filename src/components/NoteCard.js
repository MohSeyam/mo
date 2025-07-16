import React from 'react';
import { exportNoteAsMarkdown } from '../utils/noteUtils';
import { useState } from 'react';

function NoteCard({ note, lang, onClick }) {
  const typeColors = {
    cyber: 'bg-blue-100 text-blue-800 border-blue-300',
    policy: 'bg-green-100 text-green-800 border-green-300',
    soft: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    general: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  const typeIcons = {
    cyber: '🛡️',
    policy: '📜',
    soft: '🤝',
    general: '📝',
  };
  const typeLabels = {
    cyber: 'سيبراني',
    policy: 'سياسة أمنية',
    soft: 'مهارة ناعمة',
    general: 'عام',
  };
  const [showFull, setShowFull] = useState(false);
  const contentLines = note.content ? note.content.split('\n') : [];
  const preview = contentLines.slice(0, 3).join('\n');
  const isLong = contentLines.length > 3;
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
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(note.content || '');
  };
  return (
    <div
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition flex flex-col gap-2"
      onClick={() => onClick(note)}
    >
      <div className={`rounded px-2 py-1 text-xs font-bold border mb-2 w-fit flex items-center gap-1 ${typeColors[note.templateType] || typeColors.general}`}>
        <span>{typeIcons[note.templateType] || typeIcons.general}</span>
        {typeLabels[note.templateType] || 'عام'}
      </div>
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{note.title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400" title={note.updatedAt ? new Date(note.updatedAt).toLocaleString() : ''}>
          🗓️ {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : ''}
        </span>
        <button
          onClick={handleExport}
          title={lang === 'ar' ? 'تصدير' : 'Export'}
          className="ml-2 text-blue-500 hover:text-blue-700 text-lg"
        >
          ⬇️
        </button>
        <button
          onClick={handleCopy}
          title={lang === 'ar' ? 'نسخ المحتوى' : 'Copy'}
          className="ml-1 text-gray-500 hover:text-gray-700 text-lg"
        >
          📋
        </button>
      </div>
      <div className="prose prose-sm dark:prose-invert max-h-32 overflow-y-auto relative" style={{ direction: 'rtl' }}>
        <div dangerouslySetInnerHTML={{ __html: showFull ? note.content : preview.replace(/\n/g, '<br/>') }} />
        {isLong && !showFull && (
          <button
            className="absolute left-2 bottom-1 text-xs text-blue-600 hover:underline bg-white dark:bg-gray-800 px-1 rounded"
            onClick={e => { e.stopPropagation(); setShowFull(true); }}
          >
            عرض المزيد
          </button>
        )}
      </div>
      <div className="mt-1 text-xs text-gray-700 dark:text-gray-200 font-semibold flex flex-wrap gap-2">
        {note.taskData?.title?.[lang] ? (
          <span className="inline-flex items-center bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5 gap-1">
            <span>📋</span>{note.taskData?.title?.[lang]}
          </span>
        ) : null}
        {note.dayData?.title ? (
          <span className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 gap-1">
            <span>📅</span>{note.dayData?.title}
          </span>
        ) : null}
        {!note.taskData?.title?.[lang] && !note.dayData?.title && (
          <span className="inline-block bg-red-100 text-red-800 rounded px-2 py-0.5">ملاحظة عامة</span>
        )}
      </div>
      {note.keywords && note.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.keywords.map(tag => (
            <span key={tag} className="inline-flex items-center bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs border border-blue-200 dark:border-blue-700 gap-1">
              <span>🏷️</span>{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default NoteCard;