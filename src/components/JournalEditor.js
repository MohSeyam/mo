import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAppContext } from '../context/AppContext';

function JournalEditor({ weekId, dayIndex, prompt }) {
    const { lang, appState, updateJournalEntryContext, translations, showToast } = useAppContext();
    const journalEntry = appState.journal[weekId]?.days[dayIndex];
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
                    theme="snow"
                    value={journalEntry?.content || ''}
                    onChange={handleContentChange}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', background: 'white', borderRadius: 8 }}
                />
            </div>
        </div>
    );
}

export default JournalEditor;