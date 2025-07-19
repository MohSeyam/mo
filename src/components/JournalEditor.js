import React, { useRef, useContext } from 'react';
import ReactQuill, { Quill } from 'react-quill';
// CORRECTED IMPORT PATH
import 'quill/dist/quill.snow.css';
import { AppContext } from '../context/AppContext';

// إضافة دعم RTL في Quill
const Direction = Quill.import('attributors/style/direction');
Quill.register(Direction, true);

function JournalEditor({ weekId, dayIndex, prompt }) {
    const { lang, appState, updateJournalEntryContext, translations, showToast } = useContext(AppContext);
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

    // You need to define customToolbar or use the default one.
    // I'll assume you have it defined elsewhere. If not, you can define it like this:
    const customToolbar = [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        [{ 'direction': 'rtl' }], // Add RTL button
        ['clean']
    ];


    // تخصيص Toolbar مع زر القالب وزر الصورة
    const modules = {
        toolbar: {
            container: customToolbar,
            handlers: {
                image: imageHandler
            }
        }
    };

    const handleContentChange = (newContent) => {
        try {
            updateJournalEntryContext(weekId, dayIndex, newContent);
            // Removing the toast from here to avoid showing it on every keystroke.
            // It's better to have a dedicated save button or save on blur/unmount.
        } catch (e) {
            showToast('حدث خطأ أثناء الحفظ', 'error');
        }
    };
    
    // A function to call when you want to explicitly save
    const handleSave = () => {
        showToast('تم الحفظ بنجاح', 'success');
    }

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
                    style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', backgroundColor: 'white', color: 'black', borderRadius: '8px' }}
                />
                <div className="mt-2 flex gap-2">
                    <button
                        onClick={insertTemplate}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        إدراج قالب يومي
                    </button>
                     <button
                        onClick={handleSave} // Example save button
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                        حفظ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default JournalEditor;
