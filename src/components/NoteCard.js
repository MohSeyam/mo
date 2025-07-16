import React from 'react';
import { exportNoteAsMarkdown } from '../utils/noteUtils';

function NoteCard({ note, lang, onClick }) {
  const handleExport = (e) => {
    e.stopPropagation();
    const md = exportNoteAsMarkdown(note, lang);
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
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{note.title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</span>
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
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{note.taskData?.description?.[lang]}</div>
    </div>
  );
}

export default NoteCard;