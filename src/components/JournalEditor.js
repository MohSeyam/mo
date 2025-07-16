import React, { useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAppContext } from '../context/AppContext';

// إضافة دعم RTL في Quill
const Direction = Quill.import('attributors/style/direction');
Quill.register(Direction, true);

const customToolbar = [
  [{ 'header': [1, 2, 3, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }, { 'direction': 'rtl' }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['link', 'image'],
  ['clean']
];

function JournalEditor({ weekId, dayIndex, prompt }) {
  const { lang, appState, updateJournalEntryContext, translations, showToast } = useAppContext();
  const journalEntry = appState.journal[weekId]?.days[dayIndex];
  const quillRef = useRef();

  // إدراج قالب نصي جاهز
  const insertTemplate = () => {
    const quill = quillRef.current.getEditor();
    quill.insertText(0, 'ملخص اليوم:\n- أهم الأحداث:\n- المشاعر:\n- الدروس المستفادة:\n');
  };

  // رفع صورة من الجهاز
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const quill = quillRef.current.getEditor();
          quill.insertEmbed(quill.getSelection().index, 'image', reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
  };

  // تخصيص Toolbar مع زر القالب وزر الصورة
  const modules = {
    toolbar: {
      container: customToolbar,
      handlers: {
        image: imageHandler
      }
    },
    direction: lang === 'ar' ? 'rtl' : 'ltr'
  };

  const handleContentChange = (newContent) => {
    try {
      updateJournalEntryContext(weekId, dayIndex, newContent);
      showToast('تم الحفظ بنجاح', 'success');
    } catch (e) {
      showToast('حدث خطأ ما', 'error');
    }
  };

  return (
    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">{prompt.title[lang]}</h3>
      <ul className="list-disc pl-5 rtl:pr-5 space-y-2 text-gray-700 dark:text-gray-300">
        {prompt.points.map((point, i) => <li key={i}>{point[lang]}</li>)}
      </ul>
      <div className="mt-4">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={journalEntry?.content || ''}
          onChange={handleContentChange}
          modules={modules}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', background: 'white', borderRadius: 8 }}
        />
        <button
          onClick={insertTemplate}
          className="mt-2 px-3 py-1 bg-gray-200 rounded text-sm"
        >
          إدراج قالب يومي
        </button>
      </div>
    </div>
  );
}

export default JournalEditor;