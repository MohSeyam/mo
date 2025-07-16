import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plate, PlateProvider, createPlugins, createParagraphPlugin, createHeadingPlugin, createBlockquotePlugin, createListPlugin, createLinkPlugin, createTablePlugin, createImagePlugin, createMediaEmbedPlugin, createAlignmentPlugin, createCodeBlockPlugin, createHorizontalRulePlugin, createIndentPlugin, createLineHeightPlugin, createFontPlugin, createHighlightPlugin, createKbdPlugin, createMentionPlugin, createPlaceholderPlugin, createTrailingBlockPlugin, createAutoformatPlugin, createBreakPlugin, createResetNodePlugin, createBasicMarksPlugin, createSelectOnBackspacePlugin } from '@udecode/plate';
import { serializeHtml } from '@udecode/plate-serializer-html';

const plugins = createPlugins([
  createParagraphPlugin(),
  createHeadingPlugin(),
  createBlockquotePlugin(),
  createListPlugin(),
  createLinkPlugin(),
  createTablePlugin(),
  createImagePlugin(),
  createMediaEmbedPlugin(),
  createAlignmentPlugin(),
  createCodeBlockPlugin(),
  createHorizontalRulePlugin(),
  createIndentPlugin(),
  createLineHeightPlugin(),
  createFontPlugin(),
  createHighlightPlugin(),
  createKbdPlugin(),
  createMentionPlugin(),
  createPlaceholderPlugin({ placeholder: 'Start typing your note...' }),
  createTrailingBlockPlugin(),
  createAutoformatPlugin(),
  createBreakPlugin(),
  createResetNodePlugin(),
  createBasicMarksPlugin(),
  createSelectOnBackspacePlugin(),
]);

function NoteEditor({ note, taskDescription, onSave, onDelete }) {
  const { i18n } = useTranslation();
  const [title, setTitle] = useState(note.title || '');
  const [value, setValue] = useState(note.content ? JSON.parse(note.content) : [{ type: 'p', children: [{ text: '' }] }]);
  const [showPreview, setShowPreview] = useState(false);

  function handleSave() {
    onSave({ ...note, title, content: JSON.stringify(value) });
  }

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
        <PlateProvider initialValue={value} onChange={setValue} plugins={plugins}>
          <Plate editable={!showPreview} plugins={plugins} />
        </PlateProvider>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
          onClick={handleSave}
        >
          {i18n.language === 'ar' ? 'حفظ' : 'Save'}
        </button>
        <button
          className="px-4 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700"
          onClick={onDelete}
        >
          {i18n.language === 'ar' ? 'حذف' : 'Delete'}
        </button>
        <button
          className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
          onClick={() => setShowPreview(p => !p)}
        >
          {showPreview ? (i18n.language === 'ar' ? 'تحرير' : 'Edit') : (i18n.language === 'ar' ? 'معاينة' : 'Preview')}
        </button>
      </div>
      {showPreview && (
        <div className="mt-4 border-t pt-4">
          <div className="font-bold text-gray-700 dark:text-gray-200 mb-1">{i18n.language === 'ar' ? 'معاينة:' : 'Preview:'}</div>
          <div dangerouslySetInnerHTML={{ __html: serializeHtml(value) }} />
        </div>
      )}
    </div>
  );
}

export default NoteEditor;