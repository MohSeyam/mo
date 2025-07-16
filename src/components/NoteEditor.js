import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';

function NoteEditor({ note, taskDescription, onSave, onDelete }) {
  const { i18n } = useTranslation();
  const [content, setContent] = useState(note.content || '');
  const [title, setTitle] = useState(note.title || '');

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg mx-auto">
      <div className="mb-2 font-bold text-blue-700 dark:text-blue-300">
        {i18n.language === 'ar' ? 'ملاحظة للمهمة:' : 'Note for task:'} {taskDescription}
      </div>
      <input
        className="w-full mb-3 px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
        placeholder={i18n.language === 'ar' ? 'عنوان الملاحظة' : 'Note title'}
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <div className="mb-3">
        <MDEditor
          value={content}
          onChange={setContent}
          height={200}
          preview="edit"
          textareaProps={{
            placeholder: i18n.language === 'ar' ? 'اكتب ملاحظتك هنا (يدعم Markdown)' : 'Write your note here (Markdown supported)'
          }}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
          onClick={() => onSave({ ...note, title, content })}
        >
          {i18n.language === 'ar' ? 'حفظ' : 'Save'}
        </button>
        <button
          className="px-4 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700"
          onClick={onDelete}
        >
          {i18n.language === 'ar' ? 'حذف' : 'Delete'}
        </button>
      </div>
      <div className="mt-4">
        <div className="font-bold text-gray-700 dark:text-gray-200 mb-1">{i18n.language === 'ar' ? 'معاينة:' : 'Preview:'}</div>
        <MDEditor.Markdown source={content} style={{ background: 'none', color: 'inherit' }} />
      </div>
    </div>
  );
}

export default NoteEditor;