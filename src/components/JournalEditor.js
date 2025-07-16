import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';

const templates = [
  {
    key: 'reflection',
    ar: 'تأمل اليوم:\n- ماذا تعلمت اليوم؟\n- ما هو التحدي الأكبر الذي واجهته؟\n- كيف تغلبت عليه؟',
    en: 'Daily Reflection:\n- What did you learn today?\n- What was your biggest challenge?\n- How did you overcome it?'
  },
  {
    key: 'gratitude',
    ar: 'أشياء أنا ممتن لها اليوم:\n- \n- \n- ',
    en: 'Things I am grateful for today:\n- \n- \n- '
  },
  {
    key: 'plan',
    ar: 'خطة الغد:\n- \n- \n- ',
    en: 'Plan for tomorrow:\n- \n- \n- '
  },
];

function JournalEditor({ weekId, dayIndex, prompt }) {
  const { i18n } = useTranslation();
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  function handleTemplateChange(e) {
    const val = e.target.value;
    setSelectedTemplate(val);
    const tpl = templates.find(t => t.key === val);
    if (tpl) setContent(tpl[i18n.language]);
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg mx-auto mt-4">
      <div className="mb-2 font-bold text-blue-700 dark:text-blue-300">
        {prompt?.title?.[i18n.language] || (i18n.language === 'ar' ? 'تدوينة اليوم' : 'Today\'s Journal')}
      </div>
      <div className="mb-2 text-gray-600 dark:text-gray-300 text-sm">
        {prompt?.points?.map((p, i) => <div key={i}>- {p[i18n.language]}</div>)}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">{i18n.language === 'ar' ? 'اختر قالب تدوين:' : 'Choose a journal template:'}</label>
        <select value={selectedTemplate} onChange={handleTemplateChange} className="w-full px-2 py-1 rounded border">
          <option value="">{i18n.language === 'ar' ? 'بدون قالب' : 'No template'}</option>
          {templates.map(t => (
            <option key={t.key} value={t.key}>{i18n.language === 'ar' ? t.ar.split(':')[0] : t.en.split(':')[0]}</option>
          ))}
        </select>
      </div>
      <MDEditor
        value={content}
        onChange={setContent}
        height={200}
        preview="edit"
        textareaProps={{
          placeholder: i18n.language === 'ar' ? 'اكتب تدوينتك هنا (يدعم Markdown)' : 'Write your journal here (Markdown supported)'
        }}
      />
      <div className="mt-4">
        <div className="font-bold text-gray-700 dark:text-gray-200 mb-1">{i18n.language === 'ar' ? 'معاينة:' : 'Preview:'}</div>
        <MDEditor.Markdown source={content} style={{ background: 'none', color: 'inherit' }} />
      </div>
    </div>
  );
}

export default JournalEditor;